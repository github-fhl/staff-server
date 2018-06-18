const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrSalaryRecord, attrSalaryDistribution, attrCostDistribution} = require('../args'),
  {getCurrencys} = require('../systems/currency'),
  NP = require('number-precision')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)

  /**
   * year salaryRecord 的年份
   * staffType 查看的员工类型
   */

  let args = [
    new Arg('year', true),
    new Arg('staffType', true),
    new Arg('date', false),
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send({
          dateFormat: ['YYYY-MM', 'date']
        })
    })
    .catch(err => api.error(err))
}

/**
 * 获取按月份分配的 salaryRecord
 * 1. 获取对应的汇率
 * 2. 将 salaryRecord 根据月份进行分配，并按照各 salaryType 进行汇总
 *
 * @returns {Promise.<Array>}
 */

async function run (args) {
  let dateCondition = args.date ? args.date : {$like: `${args.year}%`}

  let $salaryRecords = await models.salaryRecord.findAll({
    where: {
      date: dateCondition
    },
    attributes: attrSalaryRecord,
    include: [{
      model: models.staff,
      required: true,
      attributes: ['id', 'name', 'staffType'],
      where: {staffType: args.staffType}
    }, {
      model: models.salaryDistribution,
      attributes: attrSalaryDistribution,
      separate: true,
      include: [{
        model: models.salaryType,
        attributes: ['index']
      }],
      order: [[models.salaryType, 'index', 'ASC']]
    }, {
      model: models.costDistribution,
      attributes: attrCostDistribution,
      include: [{
        model: models.position,
        as: 'position',
        attributes: ['id', 'name']
      }, {
        model: models.project,
        as: 'project',
        attributes: ['id', 'name', 'description']
      }, {
        model: models.production,
        as: 'production',
        attributes: ['id', 'description']
      }, {
        model: models.inhouseFreelancer,
        as: 'inhouseFreelancer',
        attributes: ['id', 'description']
      }]
    }],
    order: [[models.staff, 'name', 'ASC']]
  })

  if (args.date) return $salaryRecords
  let results = await distributeByYear($salaryRecords, parseInt(args.year))

  return results
}


/**
 * 获取全年的 salaryRecord ，然后按月进行分配
 * 1. 获取对应的汇率
 * 2. 将 salaryRecord 根据月份进行分配，并按照各 salaryType 进行汇总
 *
 * @param {array} $salaryRecords 所有的 salaryRecord
 * @param {number} year 年份
 * @returns {Array}
*/
async function distributeByYear ($salaryRecords, year) {

  let $currencys = await getCurrencys(year)
  let currencyRates = {}

  $currencys.rows.forEach($currency => {
    currencyRates[$currency.id] = $currency.currencyDetails[0].constantRateToRMB
  })

  let monthlySalaryRecordList = {}

  $salaryRecords.forEach($salaryRecord => {
    let currentMonth = monthlySalaryRecordList[$salaryRecord.date],
      excRate = currencyRates[$salaryRecord.currencyId]

    if (!currentMonth) {
      currentMonth = {
        date: $salaryRecord.date,
        staffNum: 0,
        totalAmount: 0
      }
    }

    $salaryRecord.salaryDistributions.forEach($salaryDistribution => {
      let currentSalaryType = currentMonth[$salaryDistribution.salaryTypeId]

      if (!currentSalaryType) {
        currentSalaryType = 0
      }

      currentSalaryType += NP.divide($salaryDistribution.amount, excRate).simpleFixed(0)

      currentMonth[$salaryDistribution.salaryTypeId] = currentSalaryType
    })

    currentMonth.totalAmount += NP.divide($salaryRecord.amount, excRate).simpleFixed(0)
    currentMonth.staffNum += 1

    monthlySalaryRecordList[$salaryRecord.date] = currentMonth
  })

  return Object.values(monthlySalaryRecordList)
}
