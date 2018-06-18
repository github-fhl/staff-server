/**
 * 在本文件中都是纯函数，数据获取到后，再调用本文件的函数
 * 命名不可与非纯函数重复
 * 不接受 sequelize 类别的数据
 */

const
  cfg = require('config').get('args'),
  {daysInYear} = require('../../components/widgets'),
  moment = require('moment'),
  NP = require('number-precision')

/**
 * 获取全年薪水
 *
 * 本地员工有 13 薪，所以全年薪水数乘以 13；外籍员工没有，* 12
 * @param {number} salary 薪水
 * @param {string} location 本地/外籍
 * @return {number}
 */
const getAnnualSalary = (salary, location) => {
  if (location === cfg.location.Local) return salary * 13
  return salary * 12
}

exports.getAnnualSalary = getAnnualSalary


/**
 * 获取基础花费
 *
 * 接收一个花费数组，然后返回对应的 annualSalary, cola, bonus
 * @param {array} costList 经过处理后的花费，[{salaryTypeId: 'Monthly Salary', amount: 10000, category: 'Salary'}]
 *        - salaryTypeId
 *        - amount
 *        - category
 *
 * @param {string} location 表明是本地还是外籍
 * @return {object} basicMoney 全年的基础花费
 *        - annualSalary
 *        - annualCola
 *        - bonus
 */
const getBasicCost = (costList, location) => {
  let annualSalary = 0,
    annualCola = 0,
    bonus = 0

  costList.forEach(item => {
    if (item.salaryTypeId === cfg.salaryType['Monthly Salary']) {
      annualSalary += getAnnualSalary(item.amount, location)
    }
    else {
      switch (item.category) {
        case cfg.salaryCategory.Cola:
          annualCola += item.amount
          break
        case cfg.salaryCategory.Bonus:
          bonus += item.amount
          break
        default:
      }
    }
  })
  annualCola *= 12

  return {annualSalary, annualCola, bonus}
}

exports.getBasicCost = getBasicCost


/**
 * 获取 position 的预算
 *
 * 根据 基础花费 和 office 的 rate，得出 position 一年的预期费用
 * @param {object} basicCost 包含三种基础金额
 *                - annualSalary
 *                - annualCola
 *                - bonus
 * @param {object} rates office 对应的计算率
 *                - mulRate
 *                - dictRate
 *                - incRate
 *                - benRate
 *                - overRate
 *                - mkpRate
 *                - taxRate
 *                - invRate
 *                - divRate
 * @param {boolean} existStaff 是否存在员工，如果存在，则计算加薪，不存在加薪为 0
 * @return {object} budget 包含多种费用
 */
const getBudget = (basicCost, rates, existStaff) => {

  let salaryInc = existStaff ? NP.divide(NP.times(basicCost.annualSalary, rates.incRate), 2).simpleFixed(0) : 0
  let directComp = NP.plus(basicCost.annualSalary, salaryInc, basicCost.annualCola, basicCost.bonus).simpleFixed(0)
  let benefits = NP.times(directComp, rates.benRate).simpleFixed(0)
  let directLabor = NP.plus(directComp, benefits).simpleFixed(0)
  let overhead = NP.times(directLabor, rates.overRate).simpleFixed(0)
  let markup = NP.times(NP.plus(directLabor, overhead), rates.mkpRate).simpleFixed(0)
  let net = NP.plus(NP.plus(directLabor, overhead), markup).simpleFixed(0)
  let tax = NP.times(net, rates.taxRate).simpleFixed(0)
  let gross = NP.plus(net, tax).simpleFixed(0)
  let budgetIncentive = NP.times(NP.plus(directLabor, overhead), rates.invRate, NP.plus(1, rates.taxRate)).simpleFixed(0)

  return Object.assign(basicCost, {
    salaryInc,
    directComp,
    benefits,
    directLabor,
    overhead,
    markup,
    net,
    tax,
    gross,
    budgetIncentive
  })
}

exports.getBudget = getBudget


/**
 * 获取 FTE
 *
 * 根据生效、失效日期，获取对应的 FTE
 * @param {string} validDate 生效日期
 * @param {string} invalidDate 失效日期
 * @return {number} FTE
 */
const getFTE = (validDate, invalidDate) => (moment(invalidDate).diff(moment(validDate), 'days') / daysInYear(moment(validDate).year())).simpleFixed()

exports.getFTE = getFTE
