const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  calculateProjectAmount = require('../projectDetail/calculateProjectAmount'),
  {ToSubmit, FDRefused, POCollected} = require('config').flowCfg.projectStatus

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)

  /**
   * - updateType updateBasicInfo / updatePOInfo
   */

  let args = [
    new Arg('id', true),
    new Arg('updateType', true),
    new Arg('clientId', false),
    new Arg('currencyId', false),
    new Arg('inChargeAccount', false),
    new Arg('description', false),
    new Arg('poCode', false),
    new Arg('fee', false),
    new Arg('productionCost', false),
    new Arg('poFilePath', false),
    new Arg('totalAmount', false)
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
  await checkUpdateProject(args.id, args.updateType, t)

  let
    fields = {
      updateBasicInfo: ['clientId', 'inChargeAccount', 'description', 'currencyId'],
      updatePOInfo: ['poCode', 'fee', 'productionCost', 'poFilePath', 'totalAmount']
    }

  let $project = await models.project.findByPrimary(args.id, {
    transaction: t,
    include: [{
      model: models.projectDetail
    }]
  })

  let updatedCurrencyFlag = $project.currencyId !== args.currencyId

  fields[args.updateType].forEach(key => {
    $project[key] = args[key]
  })

  if (updatedCurrencyFlag) await updateCurrency($project, $project.projectDetails, t)

  await $project.save({transaction: t})
}

async function checkUpdateProject (id, updateType, t) {
  let $project = await models.project.findById(id, {transaction: t})

  if (updateType === 'updateBasicInfo' && ![ToSubmit, FDRefused].includes($project.flowStatus)) {
    throw new Error(`Project 状态为 ${$project.flowStatus}，无法进行编辑`)
  }
  if (updateType === 'updatePOInfo' && ![POCollected].includes($project.flowStatus)) {
    throw new Error(`Project 状态为 ${$project.flowStatus}，无法进行编辑`)
  }

}

/**
 * 更新币种时
 * 1. 将 project 金额置为 0
 * 2. 重新计算所有 detail 数据
 */

async function updateCurrency ($project, $projectDetails, t) {
  let fields = ['FTE', 'net', 'budgetAmount', 'tax', 'gross', 'totalAmount']

  fields.forEach(key => $project[key] = 0)

  for (let $projectDetail of $projectDetails) {
    await calculateProjectAmount($project, $projectDetail, t)
  }
}
