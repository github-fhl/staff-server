const
  {models} = require('../../../models/index')

/**
 * 废弃操作
 * 1. 将 positionLog 的状态变更回去
 */

async function onAbandon (action) {
  await models.positionLog.update({
    flowStatus: this.$recruit.inLogOldStatus
  }, {
    transaction: this.t,
    where: {id: this.$recruit.positionLogId}
  })
  return this
}
module.exports = onAbandon
