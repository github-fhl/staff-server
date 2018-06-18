const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {ToSubmit, FDRefused} = require('config').flowCfg.projectStatus,
  NP = require('number-precision')

exports.updateOfficeRate = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true),
    new Arg('taxRate', true),
    new Arg('officeId', true)
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

/**
 * 修改 projectDetail 的 taxRate
 * 1. 查找到所有 相关的 detail
 * 2. 重新计算其 tax、gross
 * 3. 更新对应 project 的tax/gross/totalAmount
 *
 *
 * @param args
 * @param t
 * @return {Promise.<void>}
 */


async function run (args, t) {
  await checkUpdateOfficeRate(args.id, t)

  let $project = await models.project.findById(args.id, {
    transaction: t,
    include: [{
      model: models.projectDetail,
      required: false,
      where: {officeId: args.officeId}
    }]
  })
  let $projectDetails = $project.projectDetails

  let sumTaxBefore = $projectDetails.reduce((sum, $projectDetail) => NP.plus(sum, $projectDetail.tax), 0)
  let sumGrossBefore = $projectDetails.reduce((sum, $projectDetail) => NP.plus(sum, $projectDetail.gross), 0)

  for (let $projectDetail of $projectDetails) {
    $projectDetail.taxRate = args.taxRate
    $projectDetail.tax = NP.times(args.taxRate, $projectDetail.net)
    $projectDetail.gross = NP.plus($projectDetail.net, $projectDetail.tax)
    await $projectDetail.save({transaction: t})
  }

  let sumTaxAfter = $projectDetails.reduce((sum, $projectDetail) => NP.plus(sum, $projectDetail.tax), 0)
  let sumGrossAfter = $projectDetails.reduce((sum, $projectDetail) => NP.plus(sum, $projectDetail.gross), 0)

  $project.tax = NP.plus(NP.minus($project.tax, sumTaxBefore), sumTaxAfter)
  $project.gross = NP.plus(NP.minus($project.gross, sumGrossBefore), sumGrossAfter)

  await $project.save({transaction: t})
}

/**
 * 只有待提交、已拒绝才能进行编辑
 */

async function checkUpdateOfficeRate (id, t) {
  let $project = await models.project.findById(id, {transaction: t})

  if (![ToSubmit, FDRefused].includes($project.flowStatus)) throw new Error(`Project - ${id} 的状态为 ${$project.flowStatus}，无法进行编辑`)
}
