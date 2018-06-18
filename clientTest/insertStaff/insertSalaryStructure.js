const
  {models} = require('../../models/index'),
  {salaryDistributionType} = require('config').get('args'),
  uuidv1 = require('uuid/v1'),
  m100 = require('../m100')


async function insertSalaryStructure (staffInfos, t) {
  let salaryStructures = []
  let salaryDistributions = []

  for (let staffInfo of staffInfos) {
    let salaryStructure = {
      id: uuidv1(),
      staffId: staffInfo.id,
      validDate: staffInfo.validDate,
      currencyId: staffInfo.currencyId,
    }

    staffInfo.salaryDistributions.forEach(salaryDistribution => {
      salaryDistribution.type = salaryDistributionType.salaryStructure
      salaryDistribution.commonId = salaryStructure.id
    })

    salaryStructures.push(salaryStructure)
    salaryDistributions = [...salaryDistributions, ...staffInfo.salaryDistributions]
  }

  salaryDistributions = m100(salaryDistributions, ['amount'])

  await models.salaryStructure.bulkCreate(salaryStructures, {transaction: t})
  await models.salaryDistribution.bulkCreate(salaryDistributions, {transaction: t})
}

exports.insertSalaryStructure = insertSalaryStructure
