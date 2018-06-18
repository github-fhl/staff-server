/**
 * 在本文件中都是纯函数，数据获取到后，再调用本文件的函数
 * 命名不可与非纯函数重复
 * 不接受 sequelize 类别的数据
 */

const
  cfg = require('config').get('args')

/**
 * 获取 client 的花费
 *
 * 根据 position 的花费、FTE，获取对应 client 的花费
 * @param {object} cost position 的花费
 *    - net
 *    - tax
 *    - gross
 *    - budgetIncentive
 * @param {number} FTE 客户的分配数
 * @param {number} incentiveRate incentive 折扣率
 * @param {number} taxDiscountRate 税折扣率
 * @param {string} officeId position 的 office
 * @return {object} clientCost
 *    - FTE 客户的分配数
 *    - net
 *    - tax
 *    - gross
 *    - incentive
 *    - grandTotal
 */
const getClientCostPure = (cost, FTE, incentiveRate, taxDiscountRate, officeId) => {
  let net, tax, gross, incentive, grandTotal

  net = (cost.net * FTE).simpleFixed(0)
  tax = cfg.taxDiscountOffices.includes(officeId) ?
    (cost.tax * FTE * taxDiscountRate).simpleFixed(0) :
    (cost.tax * FTE).simpleFixed(0)
  gross = (net + tax).simpleFixed(0)
  incentive = (cost.budgetIncentive * FTE * incentiveRate).simpleFixed(0)
  grandTotal = (gross + incentive).simpleFixed(0)

  return {FTE, net, tax, gross, incentive, grandTotal}
}

exports.getClientCostPure = getClientCostPure

exports.plusFTE = (FTE1, FTE2) => ((FTE1 * 100).simpleFixed(0) + (FTE2 * 100).simpleFixed(0)) / 100

exports.minusFTE = (FTE1, FTE2) => ((FTE1 * 100).simpleFixed(0) - (FTE2 * 100).simpleFixed(0)) / 100

