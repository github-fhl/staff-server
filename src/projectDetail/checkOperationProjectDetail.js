const
  {models} = require('../../models/index'),
  {ToSubmit, FDRefused} = require('config').flowCfg.projectStatus

/**
 * 检查是否能够创建、修改、更新 projectDetail
 * 1. project 状态只能是 tosubmit、fdrefused
 */

async function checkOperationProjectDetail (projectId, t) {
  let $project = await models.project.findById(projectId, {transaction: t})

  if (![ToSubmit, FDRefused].includes($project.flowStatus)) throw new Error(`${$project.name} 的状态为 ${$project.flowStatus}，不能创建 Estimate Position`)
}
exports.checkOperationProjectDetail = checkOperationProjectDetail
