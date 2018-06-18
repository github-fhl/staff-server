const
  {models} = require('../../models/index'),
  NP = require('number-precision'),
  {Running} = require('config').get('flowCfg').productionStatus


let productions = [{
  id: 'PE201801001',
  currencyId: 'RMB', excRate: 1,
  peNet: 20250000, mulRate: 2.11,
  peFilePath: 'clientPo/路径-1513506678321.txt',
  flowStatus: Running
}]

let sameField = {
  year: 2018,
  description: '描述',
  inChargeAccount: 'Lamda'
}

productions = productions.map(production => ({
  ...production,
  ...sameField
}))

let initProduction = async t => {
  for (let productionInfo of productions) {
    productionInfo.productionNet = NP.divide(productionInfo.peNet, productionInfo.excRate).simpleFixed(0)
    productionInfo.budgetAmount = NP.divide(productionInfo.productionNet, productionInfo.mulRate).simpleFixed(0)
  }

  await models.production.bulkCreate(productions, {transaction: t})
}

exports.initProduction = initProduction
