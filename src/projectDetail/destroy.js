const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  NP = require('number-precision'),
  {getExcRate} = require('../systems/currency'),
  {checkOperationProjectDetail} = require('./checkOperationProjectDetail')

exports.destroy = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  let $projectDetail = await models.projectDetail.findById(args.id, {transaction: t})

  await checkOperationProjectDetail($projectDetail.projectId, t)
  await deleteProjectDetail(args.id, t)
}

/**
 * 删除 projectDetail
 * 1. 将 project 中对应的金额删除
 * 2. 将 projectDetail 删除
 * @return {Promise.<void>}
 */

async function deleteProjectDetail (id, t) {
  let $projectDetail = await models.projectDetail.findById(id, {
    transaction: t,
    include: [{
      model: models.project
    }]
  })

  if (!$projectDetail) throw new Error(`${id} 数据不存在`)

  let $project = $projectDetail.project
  let {fordRate} = await getExcRate($projectDetail.currencyId, $project.currencyId, $project.year, t)

  $project.FTE = NP.minus($project.FTE, $projectDetail.FTE)
  $project.net = NP.minus($project.net, NP.divide($projectDetail.net, fordRate).simpleFixed(0))
  $project.budgetAmount = NP.minus($project.budgetAmount, NP.divide($projectDetail.budgetAmount, fordRate).simpleFixed(0))
  $project.tax = NP.minus($project.tax, NP.divide($projectDetail.tax, fordRate).simpleFixed(0))
  $project.gross = NP.minus($project.gross, NP.divide($projectDetail.gross, fordRate).simpleFixed(0))
  $project.totalAmount = NP.minus($project.totalAmount, NP.divide($projectDetail.gross, fordRate).simpleFixed(0))
  await $project.save({transaction: t})

  await models.projectDetail.destroy({
    transaction: t,
    where: {id}
  })
}
exports.deleteProjectDetail = deleteProjectDetail
