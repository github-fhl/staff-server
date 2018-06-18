const
  {models} = require('../../../models/index'),
  {Recruiting} = require('config').get('flowCfg').positionLogStatus

async function onCollectJD (action) {
  await models.positionLog.update({
    flowStatus: Recruiting
  }, {
    transaction: this.t,
    where: {id: this.$recruit.positionLogId}
  })
  return this
}
module.exports = onCollectJD
