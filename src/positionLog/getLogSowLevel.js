const
  {models} = require('../../models'),
  {getDirectCompBySalaryDistribution} = require('../salaryDistribution'),
  {querySowLevel} = require('../position'),
  {salaryDistributionType} = require('config').get('args')

/**
 * 获取 positionLog 的 sowLevel
 * 1. 获取 log 的 salaryDistribution
 * 2. 获取对应的 directComp
 * 3. 获取 sowLevel
 *
 * @param {string} positionLogId positionLog id
 * @param {object} t transaction
 * @return {string}
 */
async function getLogSowLevel (positionLogId, t) {
  let $positionLog = await models.positionLog.findById(positionLogId, {transaction: t})
  let $salaryDistributions = await models.salaryDistribution.findAll({
    transaction: t,
    where: {
      type: salaryDistributionType.positionLog,
      commonId: positionLogId
    },
    include: [{
      model: models.salaryType,
      attributes: ['category']
    }]
  })
  let salaryDistributions = $salaryDistributions.map($salaryDistribution => ({
    salaryTypeId: $salaryDistribution.salaryTypeId,
    amount: $salaryDistribution.amount,
    salaryType: {
      category: $salaryDistribution.salaryType.category
    }
  }))
  let directComp = getDirectCompBySalaryDistribution(salaryDistributions, $positionLog.location)
  let sowLevel = await querySowLevel(directComp, $positionLog.currencyId, $positionLog.year - 1, t)

  return sowLevel
}
exports.getLogSowLevel = getLogSowLevel
