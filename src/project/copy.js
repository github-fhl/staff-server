const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {ToSubmit, POCollected, Completed, Abandoned, Disabled} = require('config').flowCfg.projectStatus,
  {attrProject, attrProjectDetail} = require('../args')

exports.copy = (req, res) => {
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
  let $project = await models.project.findById(args.id, {
    transaction: t,
    attributes: attrProject,
    include: [{
      model: models.projectDetail,
      attributes: attrProjectDetail
    }]
  })

  if (!$project) throw new Error(`Project ${args.id} 数据不存在`)
  await checkCopyProject($project.name, t)
  await models.project.update({flowStatus: Disabled}, {
    transaction: t,
    where: {name: $project.name}
  })

  let maxVersion = await models.project.max('version', {
    transaction: t,
    where: {name: $project.name}
  })
  let newProject = {
    ...$project.dataValues,
    version: (parseInt(maxVersion) + 1).prefix0(3),
    flowStatus: ToSubmit
  }

  delete newProject.id

  let $newProject = await models.project.create(newProject, {transaction: t})
  let newProjectDetails = $project.projectDetails.map($projectDetail => {
    let newProjectDetail = {
      ...$projectDetail.dataValues,
      projectId: $newProject.id
    }

    delete newProjectDetail.id
    return newProjectDetail
  })

  await models.projectDetail.bulkCreate(newProjectDetails, {transaction: t})

  return $newProject
}


/**
 * 检查是否能够复制 project
 * 1. 目标 project 对应的所有版本中，不能存在 POCollected/Completed/Abandoned
 */

async function checkCopyProject (name, t) {
  let $wrongProject = await models.project.findOne({
    transaction: t,
    where: {
      name,
      flowStatus: {$in: [POCollected, Completed, Abandoned]}
    }
  })

  if ($wrongProject) throw new Error(`存在 ${$wrongProject.version} 版本的 ${$wrongProject.name}，其状态为 ${$wrongProject.flowStatus}，无法进行复制`)
}
