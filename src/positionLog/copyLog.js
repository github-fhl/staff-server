const
  {models} = require('../../models/index'),
  {attrPositionLog} = require('../args'),
  {Open} = require('config').flowCfg.positionLogStatus,
  {createLogSalaryDistribution} = require('./createLogSalaryDistribution')

/**
 * 复制一条 positionLog
 *
 * 1. 获取所有 oldLog 信息
 * 2. newLog.seqNo 字母后移
 * 3. newLog.wasStaffName = oldLog.staffName
 * 4. newLog.flowStatus = oldLog.Open
 * 5. 复制对应的 salaryDistribution
 *
 * @param {string} positionLogId log 的 id
 * @param {object} t transaction
 * @return {null}
 */
async function copyLog (positionLogId, t) {
  let $oldLog = await models.positionLog.findById(positionLogId, {
    transaction: t,
    attributes: attrPositionLog,
    include: [{
      model: models.staff,
      attributes: ['name']
    }, {
      model: models.salaryDistribution
    }]
  })
  let newLog = {
    ...$oldLog.dataValues,
    seqNo: String.fromCharCode($oldLog.seqNo.charCodeAt() + 1),
    staffId: null,
    wasStaffName: $oldLog.staff.name,
    entryDate: null,
    leaveDate: null,
    flowStatus: Open
  }

  delete newLog.id

  let $newLog = await models.positionLog.create(newLog, {transaction: t})
  let salaryDistributions = $oldLog.salaryDistributions.map($salaryDistribution => ({
    salaryTypeId: $salaryDistribution.salaryTypeId,
    amount: $salaryDistribution.amount
  }))

  await createLogSalaryDistribution($newLog.id, salaryDistributions, t)
}
exports.copyLog = copyLog
