const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {
    attrProduction,
    attrCostDistribution, attrFreelancerContract,
    attrEstimateSalary, attrSalaryRecord,
  } = require('../args'),
  NP = require('number-precision'),
  {costType, costDistributionType} = require('config').get('args'),
  {getAllExcRates, getFreelancers} = require('../project/getList')

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
  let $productions = await calculateProductionBalance({year: {$in: years}}, years)

  return $productions
}


/**
 * 计算 Production 的剩余预算
 *
 * @param {object} where 查询的条件
 * @param {年份} years 年份数组
 */

async function calculateProductionBalance (where, years, t) {
  let $productions = await models.production.findAll({
    where,
    attributes: attrProduction,
    include: [{
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
                type: costDistributionType.production,
                commonId: {$eq: sequelize.col('production.id')}
              }
            }]
          }]
        }, {
          model: models.estimateSalary,
          attributes: attrEstimateSalary
        }]
      }]
    }]
  })

  let allExcRates = await getAllExcRates(years)

  for (let $production of $productions) {
    $production.dataValues.freelancers = getFreelancers($production.costDistributions, $production.currencyId, $production.year, allExcRates, $production.budgetAmount)
    $production.dataValues.allocatedAmount = $production.dataValues.freelancers.reduce((sum, freelancer) => sum = NP.plus(sum, freelancer.amount), 0)
    $production.dataValues.balance = NP.minus($production.dataValues.budgetAmount, $production.dataValues.allocatedAmount)
    delete $production.dataValues.costDistributions
  }

  return $productions
}

exports.calculateProductionBalance = calculateProductionBalance
