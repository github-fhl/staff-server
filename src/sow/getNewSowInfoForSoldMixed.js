const
  {models} = require('../../models/index'),
  {getClientCostPure} = require('../sowPosition/pureFn'),
  {sumSowPositionCost} = require('./pureFn'),
  {getExcRate, exchangeMoney} = require('../systems/currency')

/**
 *
 * 1、获取目标 sow 所包含的所有 sowPosition
 * 2、得出目标 sow 包含哪些 position，及其占的 FTE
 * 3、找到 newSow 的年份对应的 position
 * 4、根据 sowPosition 中的 FTE，算出 new sow 中的钱
 *
 * @param {string} targetSowId 目标 sow ID
 * @param {string} year 复制生成的 new sow 的年份
 * @param {object} t transaction
 * @return {object}
 *    - sowCost sow 的总花费
 *      - FTE
 *      - net
 *      - gross
 *      - grandTotal
 *    - positionCosts
 *      - positionName
 *        - positionCurrencyId
 *        - newPositionId  新 position 的 id
 *        - sowPositionCost
 *          - FTE position 在该 sow 中占的 FTE
 *          - net
 *          - tax
 *          - gross
 *          - incentive
 *          - grandTotal
 */
async function getNewSowInfoForSoldMixed (targetSowId, year, t) {
  let {positionCosts, taxDiscountRate, incentiveRate, sowCurrencyId} = await getPositionCosts(targetSowId, t)

  positionCosts = await addInfoToPositionCosts(positionCosts, year, incentiveRate, taxDiscountRate, t)

  let sowPositionCosts = await getSowPositionCosts(positionCosts, sowCurrencyId, parseInt(year) - 1, t)
  let sowCost = sumSowPositionCost(sowPositionCosts)

  return {sowCost, positionCosts}
}

exports.getNewSowInfoForSoldMixed = getNewSowInfoForSoldMixed


/**
 *
 * 根据目标 sow，获取其每个 position 的花费
 * taxDiscountRate、sowCurrencyId
 * @param {string} targetSowId 目标 sow
 * @param {object} t transaction
 * @return {object}
 *    - positionCosts
 *      - positionName
 *        - FTE position 在该 sow 中占的 FTE
 *        - positionCurrencyId
 *
 *    - taxDiscountRate 客户的折扣率
 *    - sowCurrencyId sow 的 currencyId
 */
async function getPositionCosts (targetSowId, t) {
  let $targetSow = await models.sow.findOne({
    where: {id: targetSowId},
    transaction: t,
    include: [{
      model: models.position
    }, {
      model: models.client
    }]
  })
  let incentiveRate = $targetSow.client.incentiveRate
  let taxDiscountRate = $targetSow.client.taxDiscountRate
  let sowCurrencyId = $targetSow.currencyId
  let positionCosts = {}

  $targetSow.positions.forEach($position => {
    positionCosts[$position.name] = {
      FTE: $position.sowPosition.FTE,
      positionCurrencyId: $position.currencyId
    }
  })

  return {positionCosts, taxDiscountRate, sowCurrencyId, incentiveRate}
}


/**
 *
 * 给 positionCost 添加更多的数据
 * 查找指定年份的同名 position ，并算出 sowPositionCost
 * 如果旧的 position 不存在于新的 position 中，那么在 positionCosts 中删除这条数据
 *
 * @param {string} positionCosts 所有 position 的基础花费
 *      - positionName
 *        - FTE position 在该 sow 中占的 FTE
 *        - positionCurrencyId
 *
 * @param {string} year position 的年份
 * @param {number} incentiveRate incentive 的折扣率
 * @param {number} taxDiscountRate 客户的折扣率
 * @param {object} t transaction
 * @return {object}
 *    - positionCosts
 *      - positionName
 *        - positionCurrencyId
 *        - newPositionId  新 position 的 id
 *        - sowPositionCost
 *          - FTE position 在该 sow 中占的 FTE
 *          - net
 *          - tax
 *          - gross
 *          - incentive
 *          - grandTotal
 */
async function addInfoToPositionCosts (positionCosts, year, incentiveRate, taxDiscountRate, t) {
  let $newPositions = await models.position.findAll({
    where: {
      name: {$in: Object.keys(positionCosts)},
      year,
    },
    transaction: t
  })

  $newPositions.forEach($position => {
    let temp = positionCosts[$position.name]

    temp.cost = {
      net: $position.net,
      tax: $position.tax,
      gross: $position.gross,
      budgetIncentive: $position.budgetIncentive,
    }
    temp.officeId = $position.officeId
    temp.newPositionId = $position.id
    temp.sowPositionCost = getClientCostPure(temp.cost, temp.FTE, incentiveRate, taxDiscountRate, temp.officeId)

    delete temp.FTE
    delete temp.cost
    delete temp.officeId
  })

  for (let name in positionCosts) {
    if (!positionCosts[name].newPositionId) {
      delete positionCosts[name]
    }
  }

  return positionCosts
}


/**
 *
 * 获取 sowPositionCost，
 *
 * @param {object} positionCosts 所有 position 的基础花费
 *      - positionName
 *        - positionCurrencyId
 *        - newPositionId  新 position 的 id
 *        - sowPositionCost
 *          - FTE position 在该 sow 中占的 FTE
 *          - net
 *          - tax
 *          - gross
 *          - incentive
 *          - grandTotal
 * @param {string} sowCurrencyId sow 的币种
 * @param {string} year 货币的年份
 * @param {object} t transaction
 * @return {array} sowPositionCosts sow 的 position 的花费汇总
 *    - FTE
 *    - net
 *    - tax
 *    - gross
 *    - incentive
 *    - grandTotal
 *
 */
async function getSowPositionCosts (positionCosts, sowCurrencyId, year, t) {

  let sowPositionCosts = []

  for (let name in positionCosts) {
    let positionCost = positionCosts[name]
    let {fordRate} = await getExcRate(positionCost.positionCurrencyId, sowCurrencyId, year, t)
    let toExchangeMoney = Object.assign({}, positionCost.sowPositionCost)

    delete toExchangeMoney.FTE

    sowPositionCosts.push(
      Object.assign(
        {FTE: positionCost.sowPositionCost.FTE},
        exchangeMoney(toExchangeMoney, fordRate, positionCost.positionCurrencyId, sowCurrencyId)
      )
    )
  }

  return sowPositionCosts
}
