const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  NP = require('number-precision')

exports.create = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('costType', true),
    new Arg('costCenterId', true),
    new Arg('costDistributions', true),
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => createCostDistribution(api.args.costDistributions, api.args.costType, api.args.costCenterId, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'date', 'validDate']
        })
    })
    .catch(err => api.error(err))
}

/**
 *
 * @param costDistributions
 *          - type
 *          - commonId
 *          - percentage
 *          - amount
 * @param costType
 * @param costCenterId
 * @param t
 * @return {Promise.<void>}
 */

async function createCostDistribution (costDistributions, costType, costCenterId, t) {
  let $costCenter = await models[costType].findOne({
    transaction: t,
    where: {id: costCenterId}
  })

  if (!$costCenter) throw new Error(`${costType} - ${costCenterId} - 不存在`)

  await models.costDistribution.destroy({
    transaction: t,
    where: {costCenterId}
  })

  costDistributions.forEach(costDistribution => {
    costDistribution.costType = costType
    costDistribution.costCenterId = costCenterId
  })
  checkTotal(costDistributions, $costCenter.amount)
  await models.costDistribution.bulkCreate(costDistributions, {transaction: t})
}

function checkTotal (costDistributions, totalAmount) {
  let sumPercentage = 0,
    sumAmount = 0,
    checkRepeat = []

  costDistributions.forEach(costDistribution => {
    if (checkRepeat.includes(costDistribution.commonId)) throw new Error(`${costDistribution.type}-${costDistribution.commonId} 存在重复`)

    checkRepeat.push(costDistribution.commonId)
    sumPercentage = NP.plus(sumPercentage, costDistribution.percentage)
    sumAmount = NP.plus(sumAmount, costDistribution.amount)
  })

  if (sumPercentage !== 1) throw new Error(`分配比之和必须为 100%，现为 ${sumPercentage * 100}%`)
  if (sumAmount !== totalAmount) throw new Error('分配总金额不等于总和')
}
exports.createCostDistribution = createCostDistribution
