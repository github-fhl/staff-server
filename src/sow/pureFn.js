/**
 * 在本文件中都是纯函数，数据获取到后，再调用本文件的函数
 * 命名不可与非纯函数重复
 * 不接受 sequelize 类别的数据
 */

const
  {clientType} = require('config').get('args'),
  {sowStatus} = require('config').get('flowCfg'),
  {checkExist} = require('../../components/widgets'),
  NP = require('number-precision')

/**
 * 新建 sow 时，根据 sowType，获取初始的状态
 * @param {string} sowType sow 的类别
 * @return {string}
 */
const getInitFlowStatus = sowType => {
  let flowStatus

  switch (sowType) {
    case clientType.Sold:
      flowStatus = sowStatus.toSubmit
      break
    default:
      flowStatus = sowStatus.special
  }
  return flowStatus
}

exports.getInitFlowStatus = getInitFlowStatus


/**
 * 从 sow 中移除 position (sowPosition) 时，需要减少对应的金额
 *
 * @param {object} sowInfo 数据
 *    - positionNum
 *    - FTE
 *    - openPositionNum position 是否存在员工，如果不存在，则减 1
 *    - net
 *    - gross
 *    - incentive
 *    - grandTotal
 *    - levelX 根据 position 的 sowLevel 获取是哪个 level
 * @param {object} sowPositionInfo 在该 sow 中，占的金额
 *    - FTE
 *    - net
 *    - gross
 *    - incentive
 *    - grandTotal
 *    - sowLevel
 *    - existStaff {boolean}
 * @param {number} fordRate position / sow 的汇率
 * @return {object} updatedSowInfo
 *    - positionNum
 *    - FTE
 *    - openPositionNum
 *    - net
 *    - gross
 *    - incentive
 *    - grandTotal
 *    - levelX 根据 position 的 sowLevel 获取是哪个 level
 */
const minusPosition = (sowInfo, sowPositionInfo, fordRate) => {
  checkExist(sowInfo, ['positionNum', 'FTE', 'openPositionNum', 'net', 'gross', 'incentive', 'grandTotal'])
  checkExist(sowPositionInfo, ['FTE', 'net', 'gross', 'incentive', 'grandTotal', 'sowLevel', 'existStaff'])

  sowInfo.positionNum -= 1
  sowInfo.FTE = NP.minus(sowInfo.FTE, sowPositionInfo.FTE)
  sowInfo.openPositionNum = sowPositionInfo.existStaff ?
    sowInfo.openPositionNum :
    sowInfo.openPositionNum - 1
  sowInfo.net -= NP.divide(sowPositionInfo.net, fordRate).simpleFixed(0)
  sowInfo.gross -= NP.divide(sowPositionInfo.gross, fordRate).simpleFixed(0)
  sowInfo.incentive -= NP.divide(sowPositionInfo.incentive, fordRate).simpleFixed(0)
  sowInfo.grandTotal -= NP.divide(sowPositionInfo.grandTotal, fordRate).simpleFixed(0)
  sowInfo[sowPositionInfo.sowLevel] = NP.minus(sowInfo[sowPositionInfo.sowLevel], sowPositionInfo.FTE)

  return sowInfo
}

exports.minusPosition = minusPosition


/**
 * 在 sow 中添加 position (sowPosition) 时，需要增加对应的金额
 *
 * @param {object} sowInfo 数据
 *    - positionNum
 *    - FTE
 *    - openPositionNum position 是否存在员工，如果存在，则加 1
 *    - net
 *    - gross
 *    - incentive
 *    - grandTotal
 *    - levelX 根据 position 的 sowLevel 获取是哪个 level
 * @param {object} sowPositionInfo 在该 sow 中，占的金额
 *    - FTE
 *    - net
 *    - gross
 *    - incentive
 *    - grandTotal
 *    - sowLevel
 *    - existStaff {boolean}
 * @param {number} fordRate position / sow 的汇率
 * @return {object} updatedSowInfo
 *    - positionNum
 *    - FTE
 *    - openPositionNum
 *    - net
 *    - gross
 *    - incentive
 *    - grandTotal
 *    - levelX 根据 position 的 sowLevel 获取是哪个 level
 */
const plusPosition = (sowInfo, sowPositionInfo, fordRate) => {
  checkExist(sowInfo, ['positionNum', 'FTE', 'openPositionNum', 'net', 'gross', 'incentive', 'grandTotal'])
  checkExist(sowPositionInfo, ['FTE', 'net', 'gross', 'incentive', 'grandTotal', 'sowLevel', 'existStaff'])

  sowInfo.positionNum += 1
  sowInfo.FTE = NP.plus(sowInfo.FTE, sowPositionInfo.FTE)
  sowInfo.openPositionNum = sowPositionInfo.existStaff ?
    sowInfo.openPositionNum :
    sowInfo.openPositionNum + 1
  sowInfo.net += NP.divide(sowPositionInfo.net, fordRate).simpleFixed(0)
  sowInfo.gross += NP.divide(sowPositionInfo.gross, fordRate).simpleFixed(0)
  sowInfo.incentive += NP.divide(sowPositionInfo.incentive, fordRate).simpleFixed(0)
  sowInfo.grandTotal += NP.divide(sowPositionInfo.grandTotal, fordRate).simpleFixed(0)
  sowInfo[sowPositionInfo.sowLevel] = NP.plus(sowInfo[sowPositionInfo.sowLevel], sowPositionInfo.FTE)

  return sowInfo
}

exports.plusPosition = plusPosition


/**
 * 在 sow 中更新 position (sowPosition) 时，需要修改对应的金额
 *
 * @param {object} sowInfo 数据
 *    - FTE
 *    - net
 *    - gross
 *    - incentive
 *    - grandTotal
 *    - levelX 根据 position 的 sowLevel 获取是哪个 level
 * @param {object} sowPositionInfo 在该 sow 中，position 之前的金额
 *    - FTE
 *    - net
 *    - gross
 *    - incentive
 *    - grandTotal
 *    - sowLevel
 * @param {object} updatedSowPosition 更新后的 sowPositon 数据
 *    - FTE
 *    - net
 *    - gross
 *    - incentive
 *    - grandTotal
 * @param {number} fordRate position / sow 的汇率
 * @return {object} updatedSowInfo
 *    - FTE
 *    - net
 *    - gross
 *    - grandTotal
 *    - incentive
 *    - levelX 根据 position 的 sowLevel 获取是哪个 level
 */
const updatePosition = (sowInfo, sowPositionInfo, updatedSowPosition, fordRate) => {
  checkExist(sowInfo, ['FTE', 'net', 'gross', 'incentive', 'grandTotal'])
  checkExist(sowPositionInfo, ['FTE', 'net', 'gross', 'incentive', 'grandTotal', 'sowLevel'])
  checkExist(updatedSowPosition, ['FTE', 'net', 'gross', 'incentive', 'grandTotal'])

  sowInfo.FTE = NP.plus(NP.minus(sowInfo.FTE, sowPositionInfo.FTE), updatedSowPosition.FTE)
  sowInfo.net += NP.divide(updatedSowPosition.net - sowPositionInfo.net, fordRate).simpleFixed(0)
  sowInfo.gross += NP.divide(updatedSowPosition.gross - sowPositionInfo.gross, fordRate).simpleFixed(0)
  sowInfo.incentive += NP.divide(updatedSowPosition.incentive - sowPositionInfo.incentive, fordRate).simpleFixed(0)
  sowInfo.grandTotal += NP.divide(updatedSowPosition.grandTotal - sowPositionInfo.grandTotal, fordRate).simpleFixed(0)
  sowInfo[sowPositionInfo.sowLevel] = NP.plus(NP.minus(sowInfo[sowPositionInfo.sowLevel], sowPositionInfo.FTE), updatedSowPosition.FTE)

  return sowInfo
}

exports.updatePosition = updatePosition

/**
 * 汇总 sowPosition 中的金额
 *
 * @param {array} sowPositionCosts sow 对应的 position 分配的金额
 *    - FTE 客户的分配数
 *    - net
 *    - gross
 *    - grandTotal
 * @return {object} sowCost
 *    - FTE  总客户的分配数
 *    - net
 *    - gross
 *    - grandTotal
 */
exports.sumSowPositionCost = sowPositionCosts => {
  let sowCost = {}
  let attrArr = ['FTE', 'net', 'gross', 'grandTotal']

  attrArr.forEach(attr => sowCost[attr] = 0)

  sowPositionCosts.forEach(sowPositionCost => {
    attrArr.forEach(attr => {
      sowCost[attr] = NP.plus(sowCost[attr], sowPositionCost[attr])
    })
  })

  return sowCost
}
