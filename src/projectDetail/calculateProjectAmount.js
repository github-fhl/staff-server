const
  {getExcRate} = require('../systems/currency'),
  NP = require('number-precision')

/**
 * 计算 project 的金额
 * 1. 获取 detail 与 project 的汇率
 * 2. 加到 project 中
 */

async function calculateProjectAmount ($project, projectDetail, t) {

  let {fordRate} = await getExcRate(projectDetail.currencyId, $project.currencyId, $project.year, t)

  $project.FTE = NP.plus(projectDetail.FTE, $project.FTE)
  $project.net = NP.plus(NP.divide(projectDetail.net, fordRate).simpleFixed(0), $project.net)
  $project.budgetAmount = NP.plus(NP.divide(projectDetail.budgetAmount, fordRate).simpleFixed(0), $project.budgetAmount)
  $project.tax = NP.plus(NP.divide(projectDetail.tax, fordRate).simpleFixed(0), $project.tax)
  $project.gross = NP.plus(NP.divide(projectDetail.gross, fordRate).simpleFixed(0), $project.gross)
  $project.totalAmount = NP.plus(NP.divide(projectDetail.gross, fordRate).simpleFixed(0), $project.totalAmount)
}

module.exports = calculateProjectAmount
