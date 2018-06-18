const
  {models} = require('../../models/index'),
  moment = require('moment'),
  {N} = require('config').get('args'),
  {positionLogStatus} = require('config').get('flowCfg')

/**
 * 检查该 positionLog 是否能够进行招聘正式员工、转岗
 * 1. positionLog 的状态必须为 Open
 * 2. log 对应的 position 的 executionSow 需要全部都已经确认掉
 * 3. positionLog 的年份是否为今年
 *
 * @param {string} positionLogId 对应 positionId
 * @param {object} t transaction
 * @returns {null}
 */
async function checkPositionLogRecruitOrTransferIn (positionLogId, t) {
  let $positionLog = await models.positionLog.findOne({
    transaction: t,
    attributes: ['id', 'name', 'flowStatus', 'year'],
    where: {id: positionLogId},
    include: [{
      model: models.position,
      attributes: ['id'],
      include: [{
        model: models.sowPosition,
        attributes: ['sowId', 'positionId', 'confirmFlag', 'status'],
        required: false,
        where: {
          status: 2,
          confirmFlag: N
        },
        include: [{
          model: models.sow,
          attributes: ['name']
        }]
      }]
    }]
  })

  if (!$positionLog) throw new Error(`${positionLogId} 不存在`)
  if ($positionLog.year !== moment().year()) throw new Error(`不能创建 ${$positionLog.year} 年份的申请单`)
  if ($positionLog.flowStatus !== positionLogStatus.Open) throw new Error(`${$positionLog.name} 不能创建申请单，因为状态为 ${$positionLog.flowStatus}`)
  if ($positionLog.position.sowPositions.length !== 0) {
    let sowNames = ''

    $positionLog.position.sowPositions.forEach(($sowPosition, index) => {
      if (index !== 0) sowNames += '、'
      sowNames += $sowPosition.sow.name
    })

    throw new Error(`Position 对应的 SoW - ${sowNames} - 还没有确认，无法进行创建申请单`)
  }

  return $positionLog
}

module.exports = checkPositionLogRecruitOrTransferIn
