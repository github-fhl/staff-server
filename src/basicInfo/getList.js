const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {staffType} = require('config').get('args'),
  {
    attrPositionLog, attrSalaryDistribution,
    attrFreelancerContract, attrStaff,
    attrCostDistribution, attrEstimateSalary
  } = require('../args'),
  {getBasicAmount} = require('../estimateSalary/calculateEstimateSalary')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('staffType', true),
    new Arg('year', true),
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'leaveDate']
        })
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let result

  if (args.staffType === staffType.Regular) result =  await getPositionLogs(args.year)
  if (args.staffType === staffType.Freelancer) result = await getFreelancers(args.year)

  return result
}

/**
 * 获取所有的 positionLog
 * 1. 获取对应年份的所有 positionLog
 * 2. 根据 team/stdpos/seqno 进行排序
 */

async function getPositionLogs (year) {
  let $positionLogs = await models.positionLog.findAll({
    where: {
      year,
    },
    attributes: attrPositionLog,
    include: [{
      model: models.team,
      attributes: ['name']
    }, {
      model: models.stdPos,
      attributes: ['name'],
      as: 'stdPos'
    }, {
      model: models.position,
      attributes: ['id'],
      include: [{
        model: models.sowPosition,
        required: false,
        attributes: ['FTE'],
        where: {
          status: 2
        },
        include: [{
          model: models.sow,
          attributes: ['name']
        }]
      }]
    }, {
      model: models.staff,
      attributes: ['name']
    }, {
      model: models.salaryDistribution,
      attributes: attrSalaryDistribution
    }],
    order: [
      [models.team, 'name', 'ASC'],
      [{model: models.stdPos, as: 'stdPos'}, 'name', 'ASC'],
      ['name', 'ASC'],
      ['seqno', 'ASC']
    ]
  })

  return $positionLogs
}

/**
 * 查看 Freelancer 在对应岗位上的情况
 * 1. 获取所有 Freelancer 合约 entryDate 等于当前年份的
 * 2. 获取合约对应的 员工、分配方式
 * 3. 合约中对应的最后一条基准薪资、薪资类别
 *
 */

async function getFreelancers (year) {
  let $freelancerContracts = await models.freelancerContract.findAll({
    attributes: attrFreelancerContract,
    where: sequelize.where(
      sequelize.fn('year', sequelize.col('entryDate')),
      {$eq: year}
    ),
    include: [{
      model: models.staff,
      attributes: attrStaff,
      include: [{
        model: models.team,
        attributes: ['name']
      }]
    }, {
      model: models.costDistribution,
      attributes: attrCostDistribution,
      include: [{
        model: models.position,
        as: 'position',
        attributes: ['id', 'name']
      }, {
        model: models.project,
        as: 'project',
        attributes: ['id', 'name', 'description']
      }, {
        model: models.production,
        as: 'production',
        attributes: ['id', 'description']
      }, {
        model: models.inhouseFreelancer,
        as: 'inhouseFreelancer',
        attributes: ['id', 'description']
      }]
    }, {
      model: models.estimateSalary,
      attributes: attrEstimateSalary,
      separate: true,
      limit: 1,
      order: [['month', 'DESC'], ['createdAt', 'DESC']]
    }],
    order: [
      [models.staff, models.team, 'name', 'ASC'],
      [models.staff, 'name', 'ASC'],
      ['entryDate', 'ASC']
    ]
  })

  $freelancerContracts.forEach($freelancerContract => {
    let basicAmount = getBasicAmount($freelancerContract.estimateSalaries[0].salaryTypeId, $freelancerContract.estimateSalaries[0].basicSalary, $freelancerContract.estimateSalaries[0].workdays)

    delete $freelancerContract.dataValues.estimateSalaries
    $freelancerContract.dataValues.basicAmount = basicAmount
    $freelancerContract.dataValues.salaryTypeId = $freelancerContract.estimateSalaries[0].salaryTypeId
  })

  return $freelancerContracts
}
