const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {getClientCostPure} = require('./pureFn')

const getClientCost = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('net', true, 'integer'),
    new Arg('tax', true, 'integer'),
    new Arg('gross', true, 'integer'),
    new Arg('budgetIncentive', true, 'integer'),
    new Arg('FTE', true, 'number'),
    new Arg('clientId', true),
    new Arg('officeId', true),
  ]

  if (!api.setArgs(receiveArgs)) return

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 * 获取 position 对 sow 的费用
 * @param {object} args 参数
 *    - net   都是 position 的金额
 *    - tax
 *    - gross
 *    - budgetIncentive
 *    - FTE
 *    - clientId
 *    - officeId
 * @return {object} sowPosition 中的金额
 *    - net   都是 sowPosition 的金额
 *    - tax
 *    - gross
 *    - incentive
 *    - grandTotal
 *    - FTE
 */

async function run (args, t) {
  let $client = await models.client.findOne({
    transaction: t,
    where: {id: args.clientId},
  })
  let cost = {
    net: args.net,
    tax: args.tax,
    gross: args.gross,
    budgetIncentive: args.budgetIncentive,
  }

  return getClientCostPure(cost, args.FTE, $client.incentiveRate, $client.taxDiscountRate, args.officeId)
}

exports.getClientCost = getClientCost
exports.runGetClientCost = run
