const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {createDataLog} = require('../dataLog/create'),
  {inChargeAccount} = require('config').get('args').dataLogType,
  {ToSubmit} = require('config').flowCfg.projectStatus

exports.create = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = Arg.factory(models.project)

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  await checkCreateProject(args, t)
  await createDataLog(inChargeAccount, args.inChargeAccount, t)
  args.flowStatus = ToSubmit

  let $project = await models.project.create(args, {transaction: t})

  return $project
}

/**
 * 检查创建 Project
 * 1. name 名称不能重复
 */

async function checkCreateProject (project, t) {
  let count = await models.project.count({
    transaction: t,
    where: {name: project.name}
  })

  if (count !== 0) throw new Error(`名称 - ${project.name} - 已存在`)
}
