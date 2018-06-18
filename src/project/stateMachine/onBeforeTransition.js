const
  {models} = require('../../../models/index'),
  config = require('config'),
  flowCfg = config.flowCfg,
  cfg = config.args,
  {
    financeManager, financeDirector
  } = config.init.initRoles,
  {
    complete, abandon, disable
  } = flowCfg.projectOperation,
  {handled} = cfg.applyStatus

let nextHandler = {
  create: financeManager,
  submit: financeDirector,
  fdApprove: financeManager,
  fdRefuse: financeManager,
  collectPO: null,
  complete: null,
  abandon: null,
  disable: null
}

/**
 * 1. init 操作跳过本函数
 * 2. 变更 project 的状态
 * 3. 将旧的 flowLog 变更为 handled
 * 4. 创建新的 flowLog，abandon、onboard 的 flowLog 的 nextHandleStatus 为已操作
 */

async function onBeforeTransition (action) {

  if (action.transition === 'goto') return
  await this.$project.update({flowStatus: action.to}, {transaction: this.t})

  await models.flowLog.update({nextHandleStatus: handled}, {
    transaction: this.t,
    where: {commonId: this.$project.id}
  })

  let flowLog = {
    handle: action.transition,
    handler: this.user.id,
    nextHandleRole: nextHandler[action.transition]
  }

  if ([complete, abandon, disable].includes(action.transition)) flowLog.nextHandleStatus = handled
  await this.$project.createFlowLog(flowLog, {transaction: this.t})
}
module.exports = onBeforeTransition
