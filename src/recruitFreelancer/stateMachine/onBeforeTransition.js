const
  {models} = require('../../../models/index'),
  config = require('config'),
  flowCfg = config.flowCfg,
  cfg = config.args,
  {handled} = cfg.applyStatus,
  {
    hr, financeDirector
  } = config.init.initRoles,
  {
    onboard, abandon
  } = flowCfg.recruitOperation

let nextHandler = {
  collectJD: hr,
  submit: financeDirector,
  approve: hr,
  onboard: null,
  abandon: null
}

/**
 * 1. init 操作跳过本函数
 * 2. 变更 recruit 的状态
 * 3. 将旧的 flowLog 变更为 handled
 * 4. 创建新的 flowLog，abandon、onboard 的 flowLog 的 nextHandleStatus 为已操作
 */

async function onBeforeTransition (action) {

  if (action.transition === 'goto') return
  await this.$recruit.update({flowStatus: action.to}, {transaction: this.t})

  await models.flowLog.update({nextHandleStatus: handled}, {
    transaction: this.t,
    where: {commonId: this.$recruit.id}
  })

  let flowLog = {
    handle: action.transition,
    handler: this.user.id,
    nextHandleRole: nextHandler[action.transition]
  }

  if ([onboard, abandon].includes(action.transition)) flowLog.nextHandleStatus = handled
  await this.$recruit.createFlowLog(flowLog, {transaction: this.t})
}
module.exports = onBeforeTransition
