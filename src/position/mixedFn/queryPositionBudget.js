const
  {models} = require('../../../models/index'),
  {getBasicCost, getBudget} = require('../pureFn'),
  {getExcRate} = require('../../systems/currency'),
  {budgetType} = require('config').get('args'),
  NP = require('number-precision')

/**
 * 获取 positon 的全年预算
 *
 * 根据 调整后的 basicCost / 预期的员工 / stdPos level，获取全年预算，优先级依次排列
 *
 * @param {object} option 用什么类别的方式获得 basicCost
 *    - type stdPos / staff / adjusted
 *    - stdPosDetailId
 *    - expectStaffId
 *    - adjustedBasicCost
 *        - annualSalary
 *        - annualCola
 *        - bonus
 *    - officeId 在 adjusted 类别时需要填写
 *    - currencyId position  的币种
 *    - existStaff 在 adjusted 类别时需要填写
 *    - year 在 adjusted/staff 类别时需要填写，为 position 年份 - 1
 * @param {object} t sequelize 的 trasaction
 * @return {object} budget 包含全年预算
 *    - directComp
 *    - benefits
 *    - directLabor
 *    - overhead
 *    - markup
 *    - net
 *    - tax
 *    - gross
 *    - budgetIncentive
 *
 */

const queryPositionBudget = async (option, t) => {
  let basicCost, rates, existStaff

  switch (option.type) {
    case budgetType.staff:
      existStaff = true
      basicCost = await getBasicCostByStaff(option.expectStaffId,  option.currencyId, option.year, t)
      rates = basicCost.rates
      delete basicCost.rates
      break
    case budgetType.stdPos:
      basicCost = await getBasicCostByStdPos(option.stdPosDetailId, t)
      rates = basicCost.rates
      delete basicCost.rates
      existStaff = false
      break
    case budgetType.adjusted:
      basicCost = option.adjustedBasicCost
      rates = (await models.officeDetail.findOne({
        where: {
          officeId: option.officeId,
          year: option.year
        },
        transaction: t
      })).dataValues
      existStaff = option.existStaff
      break
    default:
  }

  return getBudget(basicCost, rates, existStaff)
}

exports.queryPositionBudget = queryPositionBudget


/**
 * 根据 staff，获取对应的全年基础花费和 rates
 * 1. 获取 staff 最近的salaryStructure
 * 2. 将金额转换为 position 的币种金额
 * 3. 获取 basicCost
 *
 * @param {string} staffId id 号
 * @param {string} currencyId position 的币种，将 staff 的金额转换为 Position 币种金额
 * @param {string} year 为 position 年份 - 1，也就是当前年份
 * @param {object} t sequelize 的 trasaction
 * @return {object} basicMoney 全年的基础花费
 *        - annualSalary
 *        - annualCola
 *        - bonus
 *        - rates  office 的各种 rate
 */
async function getBasicCostByStaff (staffId, currencyId, year, t) {
  let $salaryStructure = await models.salaryStructure.findOne({
    transaction: t,
    where: {staffId},
    order: [['validDate', 'DESC']],
    include: [{
      model: models.staff
    }, {
      model: models.salaryDistribution,
      include: [{
        model: models.salaryType
      }]
    }]
  })

  if (!$salaryStructure) throw new Error(`Staff - ${staffId} - 没有对应的 salaryStructure`)

  let $officeDetail = await models.officeDetail.findOne({
    where: {
      officeId: $salaryStructure.staff.officeId,
      year
    },
    transaction: t
  })

  if (!$officeDetail) console.log({
    officeId: $salaryStructure.staff.officeId,
    year
  })

  let {constantRate} = await getExcRate($salaryStructure.currencyId, currencyId, year, t)

  let costList = $salaryStructure.salaryDistributions.map($salaryDistribution =>
    ({
      salaryTypeId: $salaryDistribution.salaryTypeId,
      amount: NP.divide($salaryDistribution.amount, constantRate).simpleFixed(0),
      category: $salaryDistribution.salaryType.category
    })
  )

  let result = getBasicCost(costList, $salaryStructure.staff.location)

  result.rates = $officeDetail.dataValues
  return result
}


/**
 * 根据 stdPos level，获取对应的全年基础花费和 rates
 *
 * @param {string} stdPosDetailId id 号
 * @param {object} t sequelize 的 trasaction
 * @return {object} basicMoney 全年的基础花费
 *        - annualSalary
 *        - annualCola
 *        - bonus
 *        - rates  office 的各种 rate
 */
async function getBasicCostByStdPos (stdPosDetailId, t) {
  let $stdPosDetail = await models.stdPosDetail.findOne({
    where: {id: stdPosDetailId},
    transaction: t,
    include: [{
      model: models.stdPos,
      as: 'stdPos'
    }, {
      model: models.stdPosPrice,
      include: [{
        model: models.salaryType
      }]
    }]
  })

  let $officeDetail = await models.officeDetail.findOne({
    where: {
      officeId: $stdPosDetail.stdPos.officeId,
      year: $stdPosDetail.year
    },
    transaction: t
  })

  let costList = $stdPosDetail.stdPosPrices.map(price =>
    ({
      salaryTypeId: price.salaryTypeId,
      amount: price.amount,
      category: price.salaryType.category
    })
  )

  let result = getBasicCost(costList, $stdPosDetail.stdPos.location)

  result.rates = $officeDetail.dataValues
  return result
}
