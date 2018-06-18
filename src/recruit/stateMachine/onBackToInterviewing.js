const
  moment = require('moment'),
  {models} = require('../../../models/index')


/**
 * 退回面试状态
 * 1. 根据条件，对应的删除用户信息
 */

async function onBackToInterviewing (action, isKeepCandidate) {
  if (isKeepCandidate) return this

  let $positionLog = await models.positionLog.findOne({
    transaction: this.t,
    where: {
      id: this.$recruit.positionLogId
    },
    include: [{
      model: models.salaryDistribution,
      attributes: ['salaryTypeId', 'amount']
    }]
  })
  let basicInfo = {
    location: $positionLog.location,
    companyId: $positionLog.companyId,
    currencyId: $positionLog.currencyId,
    officeId: $positionLog.officeId,
    teamId: $positionLog.teamId,
    titleId: $positionLog.titleId,
    stdPosId: $positionLog.stdPosId,
    skillLevel: $positionLog.skillLevel,
    stdPosDetailId: $positionLog.stdPosDetailId,
  }
  let inLogSalaryDistributions = $positionLog.salaryDistributions


  await this.$recruit.update({
    entryDate: null,
    staffName: null,
    staffId: null,
    basicInfo,
    inLogSalaryDistributions,
    staffSalaryDistributions: null,
  }, {transaction: this.t})
  return this
}
module.exports = onBackToInterviewing
