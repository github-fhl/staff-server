const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {
    attrProject,
    attrCostDistribution, attrFreelancerContract,
    attrEstimateSalary, attrSalaryRecord,
  } = require('../args'),
  NP = require('number-precision'),
  {costType, costDistributionType} = require('config').get('args')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', true)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let years = JSON.parse(args.year)
  let $projects = await calculateProjectBalance({year: {$in: years}}, years)

  return $projects
}

/**
 * 计算 project 的剩余预算
 *
 * @param {object} where 查询的条件
 * @param {年份} years 年份数组
 */

async function calculateProjectBalance (where, years, t) {

  let $projects = await models.project.findAll({
    transaction: t,
    where,
    attributes: attrProject,
    include: [{
      model: models.projectDetail,
      attributes: ['id']
    }, {
      model: models.costDistribution,
      attributes: attrCostDistribution,
      required: false,
      where: {costType: costType.freelancerContract},
      include: [{
        model: models.freelancerContract,
        as: 'freelancerContract',
        attributes: attrFreelancerContract,
        include: [{
          model: models.staff,
          attributes: ['id', 'name'],
          include: [{
            model: models.salaryRecord,
            attributes: attrSalaryRecord,
            required: false,
            where: {
              $and: [{
                date: {$gte: sequelize.fn('left', sequelize.col('costDistributions.freelancerContract.entryDate'), 7)},
              }, {
                date: {$lte: sequelize.fn('left', sequelize.col('costDistributions.freelancerContract.leaveDate'), 7)}
              }]
            },
            include: [{
              model: models.costDistribution,
              attributes: attrCostDistribution,
              required: false,
              where: {
                type: costDistributionType.project,
                commonId: {$eq: sequelize.col('project.id')}
              }
            }]
          }]
        }, {
          model: models.estimateSalary,
          attributes: attrEstimateSalary
        }]
      }]
    }],
    order: [
      ['name', 'ASC'],
      ['version', 'ASC']
    ]
  })

  let allExcRates = await getAllExcRates(years)

  $projects.forEach($project => {
    $project.dataValues.projectDetailNum = $project.projectDetails.length
    delete $project.dataValues.projectDetails
    $project.dataValues.freelancers = getFreelancers($project.costDistributions, $project.currencyId, $project.year, allExcRates, $project.budgetAmount)
    $project.dataValues.allocatedAmount = $project.dataValues.freelancers.reduce((sum, freelancer) => sum = NP.plus(sum, freelancer.amount), 0)
    $project.dataValues.balance = NP.minus($project.dataValues.budgetAmount, $project.dataValues.allocatedAmount)
    $project.dataValues.freelancerNum = $project.dataValues.freelancers.length
    delete $project.dataValues.costDistributions
  })

  return $projects
}
exports.calculateProjectBalance = calculateProjectBalance

/**
 * 获取 freelancer 的人员数量，可能有重合
 * @param costDistributions
 *          - percentage project 在 freelancer 中的占比
 *          - freelancerContract freelancer 的合同
 *              - currencyId 币种
 *              - staff freelancer
 *                  - name
 *                  - salaryRecords
 *                      - date 薪资发放月份
 *                      - currencyId 用于 record 转换的 id
 *                      - costDistributions
 *                        - amount 本 project 在该 record 中占用的金额
 *              - estimateSalaries
 *                  - month 预计月份
 *                  - currencyId 用于 estimateSalary 转换的 ID
 *                  - gross 月总金额，用总金额 * costDistributions.percentage，得到本 project 在该 estimateSalary 中占用的金额
 *
 * @param currencyId project 的 currencyId
 * @param year project 的 year
 * @param allExcRates 所有的汇率
 *
 * @return freelacner
 *            - name
 *            - percentage 在 project 中的占比
 *            - amount 已花费金额
 */

function getFreelancers (costDistributions, currencyId, year, allExcRates, budgetAmount) {
  let freelancers = {}

  for (let costDistribution of costDistributions) {
    let freelancer = {
      name: costDistribution.freelancerContract.staff.name,
      salaryRecords: {},
      estimateSalaries: {}
    }

    costDistribution.freelancerContract.staff.salaryRecords.forEach(salaryRecord => {
      freelancer.salaryRecords[salaryRecord.date] = NP.divide(salaryRecord.costDistributions[0].amount, getExcRate(salaryRecord.currencyId, currencyId, year, allExcRates))
    })
    costDistribution.freelancerContract.estimateSalaries.forEach(estimateSalary => {
      freelancer.estimateSalaries[estimateSalary.month] = NP.divide(NP.times(estimateSalary.gross, costDistribution.percentage), getExcRate(estimateSalary.currencyId, currencyId, year, allExcRates))
    })

    if (freelancers[freelancer.name]) {
      freelancers[freelancer.name] = combineCost(freelancers[freelancer.name], freelancer)
    }
    else freelancers[freelancer.name] = freelancer

    let {amount, percentage} = getFreelancerPercentage(freelancers[freelancer.name].salaryRecords, freelancers[freelancer.name].estimateSalaries, budgetAmount)

    freelancers[freelancer.name].percentage = percentage
    freelancers[freelancer.name].amount = amount
    // freelancers[freelancer.name].name = freelancer.name
    console.log('freelancers[freelancer.name]: ', freelancers[freelancer.name])
    delete freelancers[freelancer.name].salaryRecords
    delete freelancers[freelancer.name].estimateSalaries
  }

  return Object.values(freelancers)
}
exports.getFreelancers = getFreelancers


/**
 * 获取目标币种的对应的汇率
 *
 * 获取到汇率后，用 fromCurrency / rate 或 toCurrency * rate，即换算成对应的币种金额
 *
 * @param fromCurrencyId
 * @param toCurrencyId
 * @param year
 * @param allExcRates
 *          - currencyId-year 币种加年份，获得对应的汇率
 */

function getExcRate (fromCurrencyId, toCurrencyId, year, allExcRates) {
  return NP.divide(allExcRates[`${fromCurrencyId}-${year}`], allExcRates[`${toCurrencyId}-${year}`])
}


/**
 * 结合 Freelancer 中的费用
 * 1. salaryRecord 中的金额用替换
 * 2. estimateSalary 中的金额用相加
 *
 *  - freelancer1
 *      - name
 *      - salaryRecords
 *          - date - amount  key - 月份，value - amount
 *      - estimateSalaries
 *          - month - amount  key - 月份，value - amount
 */

function combineCost (freelancer1, freelancer2) {
  let freelancer = {
    salaryRecords: {
      ...freelancer1.salaryRecords,
      ...freelancer2.salaryRecords
    },
    estimateSalaries: {
      ...freelancer1.estimateSalaries
    }
  }

  for (let key in freelancer2.estimateSalaries) {
    if (freelancer.estimateSalaries[key]) {
      freelancer.estimateSalaries[key] = NP.plus(freelancer.estimateSalaries[key], freelancer2.estimateSalaries[key])
    }
  }

  return freelancer
}


/**
 * 获取 freelancer 对 project 占用金额和占比
 */

function getFreelancerPercentage (salaryRecords, estimateSalaries, budgetAmount) {
  let allPrice = {
    ...estimateSalaries,
    ...salaryRecords
  }
  let amount = Object.values(allPrice).reduce((sum, item) => NP.plus(sum, item), 0)
  let percentage = NP.divide(amount, budgetAmount).simpleFixed(4)

  return {amount, percentage}
}

/**
 * 获取所有币种的 ford Rate
 *
 * @param {array} years 对应的年份，数组
 * @param t
 */

async function getAllExcRates (years) {

  let $currencyDetails = await models.currencyDetail.findAll({
    where: {year: {$in: years}}
  })
  let allExcRates = {}

  $currencyDetails.forEach($currencyDetail => {
    allExcRates[`${$currencyDetail.currencyId}-${$currencyDetail.year}`] = $currencyDetail.fordRateToRMB
  })

  return allExcRates
}
exports.getAllExcRates = getAllExcRates
