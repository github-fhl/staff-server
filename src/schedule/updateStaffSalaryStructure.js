const
  {models, sequelize} = require('../../models/index'),
  schedule = require('node-schedule'),
  NP = require('number-precision'),
  moment = require('moment'),
  {updateStaffSalaryStructureRule} = require('./rules'),
  config = require('config'),
  {salaryType} = config.args,
  {Regular} = config.args.staffType,
  {Onboarded} = config.flowCfg.staffStatus,
  {insertSalaryStructure} = require('../staff/salaryStructure')

/**
 * 跨年时更新所有正式员工的 salaryStructure
 * 1. 获取所有在职的正式员工的 SalaryStructure
 * 2. 判断是否存在 salaryIncrease
 * 3. 存在则创建新的一条 salaryStructure 及对应的 salaryDistribution
 */

exports.updateStaffSalaryStructure = schedule.scheduleJob(updateStaffSalaryStructureRule, () => {
  sequelize.transaction(t => run(t))
})

async function run (t) {
  let $staffs = await models.staff.findAll({
    transaction: t,
    where: {
      staffType: Regular,
      flowStatus: Onboarded
    },
    include: [{
      model: models.salaryStructure,
      attributes: ['id', 'staffId', 'validDate', 'currencyId'],
      separate: true,
      order: [['validDate', 'DESC']],
      limit: 1,
      include: [{
        model: models.salaryDistribution,
        attributes: ['type', 'commonId', 'salaryTypeId', 'amount']
      }]
    }]
  })

  for (let $staff of $staffs) {
    let $salaryStructure = $staff.salaryStructures[0]
    let $salaryDistributions = $salaryStructure.salaryDistributions

    let newSalaryStructure = {
      ...$salaryStructure.dataValues,
      validDate: moment().format('YYYY-MM')
    }
    let newSalaryDistributions = []
    let increasedAmount = 0

    for (let $salaryDistribution of $salaryDistributions) {
      if ($salaryDistribution.salaryTypeId === salaryType['Salary Increase']) {
        increasedAmount = $salaryDistribution.amount
      }
    }

    for (let $salaryDistribution of $salaryDistributions) {
      if ($salaryDistribution.salaryTypeId === salaryType['Monthly Salary']) {
        $salaryDistribution.dataValues.amount = NP.plus($salaryDistribution.amount, increasedAmount)
      }

      if ($salaryDistribution.salaryTypeId !== salaryType['Salary Increase']) {
        newSalaryDistributions.push($salaryDistribution.dataValues)
      }
    }

    if (increasedAmount !== 0) {
      await insertSalaryStructure(newSalaryStructure, newSalaryDistributions, t)
    }
  }

}
