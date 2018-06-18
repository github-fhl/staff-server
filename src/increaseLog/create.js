const
  {ApiDialect, Arg} = require('api-dialect'),
  moment = require('moment'),
  {models, sequelize} = require('../../models/index'),
  {N, Y, salaryDistributionType, salaryType, staffType, location, salaryCategory} = require('config').get('args'),
  {Onboarded} = require('config').get('flowCfg').staffStatus,
  {attrSalaryStructure, attrSalaryDistribution} = require('../args'),
  {calculateSocialTax} = require('../systems/company'),
  {insertSalaryStructure} = require('../staff'),
  {getDirectCompBySalaryDistribution} = require('../salaryDistribution'),
  {querySowLevel} = require('../position')

/**
 * 加薪
 * 1. increaseLogs
 *      - staffId
 *      - increaseRate
 *      - monthlySalary
 *      - salaryIncrease
 * 2. increaseMonth 实际加薪月份
 * 3. increaseCycleMonth 用户查询时的理论加薪月
 *
 */

exports.create = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('increaseLogs', true),
    new Arg('increaseMonth', true),
    new Arg('increaseCycleMonth', true),
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  for (let increaseLog of args.increaseLogs) {
    await checkIncrease(increaseLog.staffId, args.increaseMonth, t)

    let $increaseLog = await handleIncrease(increaseLog, args.increaseMonth, args.increaseCycleMonth, t)

    await generatorIncreasedSalaryStructure($increaseLog.staffId, $increaseLog.increaseMonth, $increaseLog.monthlySalary, $increaseLog.salaryIncrease, t)
  }
}


/**
 * 检查员工是否能够进行加薪操作
 * 1. 加薪月必须是本年份进行加薪
 * 2. 员工为正式员工，且为 Onboard
 * 3. 加薪月要晚于该员工最后一次已加薪月份
 * 4. 如果员工为新员工，没有已加薪月份，亦可
 */

async function checkIncrease (staffId, increaseMonth, t) {
  if (moment(increaseMonth).year() !== moment().year()) throw new Error('只能在当前年份进行加薪')

  let $staff = await models.staff.findById(staffId, {
    transaction: t,
    include: [{
      model: models.increaseLog,
      required: false,
      separate: true,
      where: {increased: Y},
      order: [['increaseMonth', 'DESC']],
      limit: 1
    }]
  })

  if ($staff.staffType !== staffType.Regular) throw new Error(`${$staff.name} 为 ${$staff.staffType}，不是正式员工，无法进行加薪操作`)
  if ($staff.flowStatus !== Onboarded) throw new Error(`${$staff.name} 的状态为 ${$staff.flowStatus}，无法进行加薪操作`)

  if ($staff.increaseLogs.length === 1 && $staff.increaseLogs[0].increaseMonth > increaseMonth) {
    throw new Error(`${$staff.name} 上次已加薪月为 ${$staff.increaseLogs[0].increaseMonth}，晚于 ${increaseMonth}，无法进行加薪`)
  }
}


/**
 * 处理加薪情况
 *
 * 1. 根据 staff 找到最近的待加薪 log，然后修改其 increaseMonth、increaseRate、monthlySalary、salaryIncrease
 * 2. 根据员工的加薪周期生成新的加薪 log
 * 3. 更新 staffHistory 中的下次加薪月
 *
 * @param {object} increaseLog 加薪后的 log 数据
 *          - staffId
 *          - increaseRate
 *          - monthlySalary
 *          - salaryIncrease
 * @param {string} increaseMonth 加薪月份
 * @param {string} increaseCycleMonth 理论加薪月份，保证预计加薪月一直在 1、7 月 cycle 中
 * @param {object} t transaction
 * @returns {Promise.<{$increaseLog: *}>}
 */
async function handleIncrease (increaseLog, increaseMonth, increaseCycleMonth, t) {
  let $staff = await models.staff.findOne({
    transaction: t,
    where: {id: increaseLog.staffId},
    include: [{
      model: models.staffHistory,
      where: {validFlag: Y}
    }]
  })
  let $increaseLog = await models.increaseLog.findOne({
    transaction: t,
    where: {
      increased: N,
      staffId: increaseLog.staffId,
    }
  })
  let $staffHistory = $staff.staffHistories[0]

  $increaseLog.increased = Y
  $increaseLog.increaseMonth = increaseMonth
  for (let key in increaseLog) {
    $increaseLog[key] = increaseLog[key]
  }
  await $increaseLog.save({transaction: t})

  let nextIncreaseMonth = moment(increaseCycleMonth).add($staffHistory.increaseCycle, 'M').format('YYYY-MM')
  let newIncreaseLog = {
    staffId: $increaseLog.staffId,
    increased: N,
    increaseMonth: nextIncreaseMonth,
  }

  await models.increaseLog.create(newIncreaseLog, {transaction: t})
  await $staffHistory.update({nextIncreaseMonth}, {transaction: t})

  return $increaseLog
}

/**
 *
 * 创建 staff 对应的加薪后的 salaryStructure
 *
 * 1. 复制得到最近的 Salarystructure
 * 2. 增加 Salary increase (可能需要更新 monthly salary，如果一年加多次薪水)
 * 3. 如果是本地员工，根据 monthly Salary + Salary increase 算出对应的 social tax
 * 4. 如果是本地员工，更新对应的 13th salary
 * 5. 更新对应 positionLog 信息
 *
 * @param {string} staffId 加薪员工的 id
 * @param {string} validDate 加薪对应的生效年月，'2017-04
 * @param {number} monthlySalary 月工资
 * @param {number} salaryIncrease 加薪金额
 * @param {object} t transaction
 * @returns {null}
 */
async function generatorIncreasedSalaryStructure (staffId, validDate, monthlySalary, salaryIncrease, t) {
  let $oldSalaryStructure = await models.salaryStructure.findOne({
    transaction: t,
    attributes: attrSalaryStructure,
    where: {staffId},
    order: [['validDate', 'DESC']],
    include: [{
      model: models.salaryDistribution,
      attributes: attrSalaryDistribution,
      where: {
        salaryTypeId: {$notIn: [salaryType['Monthly Salary'], salaryType['Salary Increase'], salaryType['Social Taxes'], salaryType['13th Salary']]}
      },
      required: false,
      include: [{
        model: models.salaryType,
        attributes: ['id', 'category']
      }]
    }]
  })
  let $staff = await models.staff.findById(staffId, {
    transaction: t,
    attributes: ['id', 'companyId', 'location', 'currencyId'],
    include: [{
      model: models.positionLog,
      attributes: ['id', 'staffId', 'sowLevel'],
      separate: true,
      order: [['entryDate', 'DESC'], ['year', 'DESC']],
      limit: 1
    }]
  })

  let newSalaryStructure = {staffId, validDate}
  let newSalaryDistributions = $oldSalaryStructure.salaryDistributions.map($salaryDistribution => ({
      type: salaryDistributionType.salaryStructure,
      salaryTypeId: $salaryDistribution.salaryTypeId,
      amount: $salaryDistribution.amount,
      salaryType: {
        category: $salaryDistribution.salaryType.category
      }
    })
  )

  newSalaryDistributions.push({
    type: salaryDistributionType.salaryStructure,
    salaryTypeId: salaryType['Monthly Salary'],
    amount: monthlySalary,
    salaryType: {
      category: salaryCategory.Salary
    }
  }, {
    type: salaryDistributionType.salaryStructure,
    salaryTypeId: salaryType['Salary Increase'],
    amount: salaryIncrease,
    salaryType: {
      category: salaryCategory.Salary
    }
  })

  if ($staff.location === location.Local) {
    newSalaryDistributions.push({
      type: salaryDistributionType.salaryStructure,
      salaryTypeId: salaryType['13th Salary'],
      amount: monthlySalary + salaryIncrease,
      salaryType: {
        category: salaryCategory.Salary
      }
    })

    let socialTax = await calculateSocialTax(monthlySalary, $staff.companyId, moment(validDate).year(), t)

    newSalaryDistributions.push({
      type: salaryDistributionType.salaryStructure,
      salaryTypeId: salaryType['Social Taxes'],
      amount: socialTax,
      salaryType: {
        category: salaryCategory.Social
      }
    })
  }

  await insertSalaryStructure(newSalaryStructure, newSalaryDistributions, t)
  await updatePositionLog($staff.positionLogs[0].id, newSalaryDistributions, moment(validDate).year(), t)
}

/**
 * 1. 找到员工对应的 positionLog，然后重新计算 sowLevel，并更新
 * 2. 删除原 positionLog 的 salaryDistribution，然后重新创建一份
 *
 * - positionLogId
 * - newSalaryDistributions
 *    - type
 *    - salaryTypeId
 *    - amount
 *    - salaryType
 * - year 年份
 */

async function updatePositionLog (positionLogId, staffSalaryDistributions, year, t) {
  let $positionLog = await models.positionLog.findById(positionLogId, {transaction: t})
  let directComp = getDirectCompBySalaryDistribution(staffSalaryDistributions, $positionLog.location)
  let sowLevel = await querySowLevel(directComp, $positionLog.currencyId, year, t)

  await $positionLog.update({sowLevel}, {transaction: t})

  await models.salaryDistribution.destroy({
    transaction: t,
    where: {
      commonId: positionLogId,
      type: salaryDistributionType.positionLog
    }
  })

  let logSalaryDistributions = staffSalaryDistributions.map(staffSalaryDistribution => ({
    ...staffSalaryDistribution,
    type: salaryDistributionType.positionLog,
    commonId: positionLogId,
  }))

  await models.salaryDistribution.bulkCreate(logSalaryDistributions, {transaction: t})
}
