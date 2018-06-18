/**
 * 在本文件中都是非纯函数，读取 IO 操作后，调用纯函数
 * 命名不可与纯函数重复
 */

const
  {models} = require('../../models/index'),
  {getExcRate} = require('../systems/currency'),
  {minusPosition, plusPosition, updatePosition} = require('../sow/pureFn'),
  {checkExist, bulkParseFloat} = require('../../components/widgets'),
  {flowCfg, cfg} = require('config'),
  {POCollected, special} = flowCfg.sowStatus,
  {Y, N} = cfg,
  {NoChange} = require('config').get('args').operation

/**
 * 创建或更新或删除 sowPosition
 * 有很多方法会调用，不要进行修改
 *
 * 创建：不存在 id
 * 更新：存在 id，FTE 不为 0
 * 删除：存在 id，FTE 为 0
 *
 * @param {object} sowPosition 数据
 *    - id 根据是否存在 id，来判断是创建还是编辑
 *    - sowId sow 的 ID
 *    - positionId position 的 ID
 *    - FTE 分配的 FTE
 *
 *    - net net 金额
 *    - tax 金额
 *    - gross
 *    - incentive
 *    - grandTotal
 * @param {object} t transaction
 * @return {null}
 */
const createOrUpdateOrDeleteSowPosition = async (sowPosition, t) => {
  checkExist(sowPosition, ['sowId', 'positionId', 'FTE', 'net', 'tax', 'gross', 'incentive', 'grandTotal'])
  bulkParseFloat(sowPosition, ['FTE', 'net', 'tax', 'gross', 'incentive', 'grandTotal'])
  if (!sowPosition.id) {
    await createSowPosition(sowPosition, t)
  }
  else {
    if (sowPosition.FTE === 0) {
      await deleteSowPosition(sowPosition.id, t)
    }
    else {
      if (sowPosition.operation !== NoChange) await updateSowPosition(sowPosition, t)
    }
  }
}

module.exports.createOrUpdateOrDeleteSowPosition = createOrUpdateOrDeleteSowPosition

/**
 * 创建 sowPosition
 * 1. 如果目标 sow 是执行版本，status = 2
 * 2. 如果目标 sow 的状态为 POCllected、special，则对应的 sowPosition 为已确认
 *
 * @param {object} sowPosition 数据
 *    - sowId sow 的 ID
 *    - positionId position 的 ID
 *    - FTE 分配的 FTE
 *
 *    - net net 金额
 *    - tax 金额
 *    - gross
 *    - incentive
 *    - grandTotal
 * @param {object} t transaction
 * @return {null}
 */
async function createSowPosition (sowPosition, t) {
  let count = await models.sowPosition.count({
    where: {sowId: sowPosition.sowId, positionId: sowPosition.positionId},
    transaction: t
  })
  let $targetSow = await models.sow.findByPrimary(sowPosition.sowId, {transaction: t})

  if (count !== 0) {
    let $position = await models.position.findByPrimary(sowPosition.positionId, {transaction: t})

    throw new Error(`SOW ${$targetSow.name} 中已存在该 Position ${$position.name}`)
  }

  sowPosition = {
    ...sowPosition,
    confirmFlag: [POCollected, special].includes($targetSow.flowStatus) ? Y : N,
    status: $targetSow.isExecution === Y ? 2 : 1
  }

  let sowPositionId = (await models.sowPosition.create(sowPosition, {transaction: t})).id
  let {$sow, sowInfo, sowPositionInfo, fordRate} = await getInfo(sowPositionId, t)
  let updatedSowInfo = plusPosition(sowInfo, sowPositionInfo, fordRate)

  await $sow.update(updatedSowInfo, {transaction: t})
}


/**
 * 更新 sowPosition
 *
 * @param {string} updatedSowPosition 修改后的 sowPosition 的数据
 *    - id sowPosition 的 ID
 *    - sowId sow 的 ID
 *    - positionId position 的 ID
 *    - FTE 分配的 FTE
 *
 *    - net net 金额
 *    - tax 金额
 *    - gross
 *    - incentive
 *    - grandTotal
 * @param {object} t transaction
 * @return {null}
 */
async function updateSowPosition (updatedSowPosition, t) {
  let {$sowPosition, $sow, sowInfo, sowPositionInfo, fordRate} = await getInfo(updatedSowPosition.id, t)
  let updatedSowInfo = updatePosition(sowInfo, sowPositionInfo, updatedSowPosition, fordRate)

  await $sow.update(updatedSowInfo, {transaction: t})
  await $sowPosition.update(updatedSowPosition, {transaction: t})
}

/**
 * 删除 sowPosition
 *
 * 当 sowPosition 的 FTE 为 0 时，将该 sowPosition 删除
 * @param {string} sowPositionId id
 * @param {object} t transaction
 * @return {null}
 */
async function deleteSowPosition (sowPositionId, t) {
  let {$sow, sowInfo, sowPositionInfo, fordRate} = await getInfo(sowPositionId, t)
  let updatedSowInfo = minusPosition(sowInfo, sowPositionInfo, fordRate)

  await $sow.update(updatedSowInfo, {transaction: t})
  await models.sowPosition.destroy({
    where: {id: sowPositionId},
    transaction: t
  })
}


/**
 * 获得 创建、更新、废弃 sowPosition 的前置数据
 *
 * @param {string} sowPositionId id
 * @param {object} t transaction
 * @return {object}
 *    - $sowPosition
 *    - $sow
 *    - $position
 *    - fordRate
 *    - sowInfo
 *    - sowPositionInfo
 */
async function getInfo (sowPositionId, t) {
  let $sowPosition = await models.sowPosition.findOne({
    where: {id: sowPositionId},
    transaction: t,
    include: [{
      model: models.sow
    }, {
      model: models.position
    }]
  })

  if (!$sowPosition) throw new Error('该数据不存在')

  let $sow = $sowPosition.sow
  let $position = $sowPosition.position

  let {fordRate} = await getExcRate($position.currencyId, $sow.currencyId, parseInt($position.year) - 1, t)

  let sowInfo = {
    positionNum: $sow.positionNum,
    FTE: $sow.FTE,
    openPositionNum: $sow.openPositionNum,
    net: $sow.net,
    gross: $sow.gross,
    incentive: $sow.incentive,
    grandTotal: $sow.grandTotal,
  }
  let sowPositionInfo = {
    FTE: $sowPosition.FTE,
    net: $sowPosition.net,
    gross: $sowPosition.gross,
    incentive: $sowPosition.incentive,
    grandTotal: $sowPosition.grandTotal,
    sowLevel: $position.sowLevel,
    existStaff: $position.expectStaffId ? true : false
  }

  sowInfo[sowPositionInfo.sowLevel] = $sow[sowPositionInfo.sowLevel]
  return {$sowPosition, $sow, $position, fordRate, sowInfo, sowPositionInfo}
}
