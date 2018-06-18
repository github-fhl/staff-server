const
  {models} = require('../../models/index'),
  {salaryDistributionType} = require('config').get('args')

/**
 * 创建 positionLog 的 salaryDistribution
 * 1. 删除 log 旧的 salaryDistribution
 * 2. 创建新的 salaryDistribution
 *
 * @param {string} positionLogId log id
 * @param {array} salaryDistributions 对应的钱
 *                    - salaryTypeId
 *                    - amount
 * @param {object} t transaction
 *
 * @return {Promise.<void>}
 */
async function createLogSalaryDistribution (positionLogId, salaryDistributions, t) {
  await models.salaryDistribution.destroy({
    transaction: t,
    where: {
      type: salaryDistributionType.positionLog,
      commonId: positionLogId
    }
  })

  salaryDistributions.forEach(salaryDistribution => {
    salaryDistribution.type = salaryDistributionType.positionLog
    salaryDistribution.commonId = positionLogId
  })

  await models.salaryDistribution.bulkCreate(salaryDistributions, {transaction: t})
}
exports.createLogSalaryDistribution = createLogSalaryDistribution
