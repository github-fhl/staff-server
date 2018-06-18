const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrIncreaseLog, attrSalaryStructure, attrSalaryDistribution} = require('../args'),
  {Y, staffType, salaryType} = require('config').get('args'),
  {Onboarded, Transferring} = require('config').get('flowCfg').staffStatus,
  moment = require('moment'),
  {getIncreasedEffect} = require('./getIncreasedEffect')

let attrStaff = ['id', 'name', 'officeId', 'currencyId', 'location', 'staffType']

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('increaseMonth', true),
    new Arg('officeIds', true)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 * 1. 选出所有对应月份的 increaseLog
 * 2. 获取所有该加薪月的员工
 * 3. 根据对应月份的 log，分为已加薪员工、未加薪员工
 * 4. 获取所有非该加薪月的员工
 * 6. 得到每个员工的月薪
 *      1. 未加薪员工月薪为当前薪水 monthlySalary + salaryIncrease
 *      2. 已加薪员工月薪为对应的 increaseLog 中的月薪
 *      3. 周期外的员工，为当前薪水 monthlySalary + salaryIncrease
 * 5. 计算 1、7 月的加薪影响
 *
 * @param args
 * @return {Promise<void>}
 */

async function run (args) {
  let officeIds = JSON.parse(args.officeIds)
  let $increaseLogs = await models.increaseLog.findAll({
    where: {
      increaseMonth: args.increaseMonth,
    },
    include: [{
      model: models.staff,
      where: {
        officeId: {$in: officeIds}
      }
    }]
  })
  let inMonthStaffIds = $increaseLogs.map($increaseLog => $increaseLog.staffId)
  let $inMonthStaffs = await models.staff.findAll({
    where: {
      staffType: staffType.Regular,
      id: {$in: inMonthStaffIds},
      officeId: {$in: officeIds},
      flowStatus: {$in: [Onboarded, Transferring]}
    },
    attributes: attrStaff,
    include: [{
      model: models.increaseLog,
      separate: true,
      attributes: attrIncreaseLog,
      where: {
        increaseMonth: {$lte: args.increaseMonth}
      },
      order: [['increaseMonth', 'DESC']],
      limit: 2
    }, {
      model: models.salaryStructure,
      separate: true,
      limit: 1,
      attributes: attrSalaryStructure,
      order: [['validDate', 'DESC']],
      include: [{
        model: models.salaryDistribution,
        attributes: attrSalaryDistribution,
        separate: true,
        where: {
          salaryTypeId: {$in: [salaryType['Monthly Salary'], salaryType['Salary Increase']]}
        }
      }]
    }, {
      model: models.team,
      attributes: ['name']
    }],
    order: [
      [models.team, 'name', 'ASC'],
      ['name', 'ASC']
    ]
  })
  let $outMonthStaffs = await models.staff.findAll({
    where: {
      staffType: staffType.Regular,
      id: {$notIn: inMonthStaffIds},
      officeId: {$in: officeIds},
      flowStatus: {$in: [Onboarded, Transferring]}
    },
    attributes: attrStaff,
    include: [{
      model: models.increaseLog,
      separate: true,
      attributes: attrIncreaseLog,
      order: [['increaseMonth', 'DESC']],
      limit: 2
    }, {
      model: models.salaryStructure,
      separate: true,
      limit: 1,
      attributes: attrSalaryStructure,
      order: [['validDate', 'DESC']],
      include: [{
        model: models.salaryDistribution,
        attributes: attrSalaryDistribution,
        separate: true,
        where: {
          salaryTypeId: {$in: [salaryType['Monthly Salary'], salaryType['Salary Increase']]}
        }
      }]
    }, {
      model: models.team,
      attributes: ['name']
    }],
    order: [
      [models.team, 'name', 'ASC'],
      ['name', 'ASC']
    ]
  })

  let
    toIncreaseStaff = [],
    increasedStaff = []

  $inMonthStaffs.forEach($inMonthStaff => {
    if ($inMonthStaff.increaseLogs[0].increased === Y) {
      increasedStaff.push($inMonthStaff)
      $inMonthStaff.dataValues.monthlySalary =
        $inMonthStaff.increaseLogs[0].monthlySalary
    }
    else {
      toIncreaseStaff.push($inMonthStaff)
      $inMonthStaff.dataValues.monthlySalary =
        $inMonthStaff.dataValues.salaryStructures[0].salaryDistributions.reduce((sum, item) => sum + item.amount, 0)
    }

    delete $inMonthStaff.dataValues.salaryStructures
  })

  $outMonthStaffs.forEach($outMonthStaff => {
    $outMonthStaff.dataValues.monthlySalary =
      $outMonthStaff.dataValues.salaryStructures[0].salaryDistributions.reduce((sum, item) => sum + item.amount, 0)
    delete $outMonthStaff.dataValues.salaryStructures
  })

  let year = moment(args.increaseMonth).year(),
    JanMonth = `${year}-01`,
    JulyMonth = `${year}-07`,
    JanEffect = await getIncreasedEffect(JanMonth),
    JulyEffect = await getIncreasedEffect(JulyMonth)

  return {
    toIncreaseStaff,
    increasedStaff,
    allIncreaseStaff: $inMonthStaffs,
    shouldNotStaff: $outMonthStaffs,
    JanEffect,
    JulyEffect
  }
}
