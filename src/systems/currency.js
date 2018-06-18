const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  NP = require('number-precision'),
  moment = require('moment')

const
  attrMainCfg = ['id', 'country'],
  attrDetailCfg = ['id', 'constantRateToUSD', 'fordRateToUSD', 'constantRateToRMB', 'fordRateToRMB', 'year', 'currencyId']


exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', false)
  ]

  if (!api.setArgs(args)) return

  getCurrencys(api)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}


/**
 *
 * @param {object} api || {number} year 参数
 * @param {object} t transaction
 * @returns {Promise.<{rows: *, count}>}
 */
async function getCurrencys (api, t) {
  let year = typeof api === 'object' ? api.args.year : api

  let $currencys = await models.currency.findAll({
    transaction: t,
    attributes: attrMainCfg,
    order: 'id ASC',
    include: [{
      model: models.currencyDetail,
      required: false,
      attributes: attrDetailCfg,
      where: {
        year: year || (new Date()).getFullYear()
      }
    }]
  })

  return {rows: $currencys, count: $currencys.length}
}
exports.getCurrencys = getCurrencys

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return


  let run = async () => {
    let $currency = await models.currency.findOne({
      where: {
        id: api.args.id
      },
      attributes: attrMainCfg,
      include: [{
        model: models.currencyDetail,
        required: false,
        attributes: attrDetailCfg,
        separate: true,
        order: 'year ASC'
      }]
    })

    return $currency
  }

  run()
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.new = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.currency)

  if (!api.setArgs(args)) return

  let run = async t => {
    let $currency = await models.currency.create(api.args, {transaction: t})

    await models.currencyDetail.create({
      year: moment().year(),
      currencyId: $currency.id
    }, {transaction: t})

    return $currency
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}


/**
 * 获取 fromCurrencyId / toCurrencyId 的汇率，返回内部和外部的汇率
 *
 * 获取到汇率后，用 fromCurrency / rate 或 toCurrency * rate，即换算成对应的币种金额
 *
 * @param {string} fromCurrencyId 来源币种
 * @param {string} toCurrencyId 基准币种
 * @param {string} year 汇率对应的年份
 * @param {object} t transaction
 * @return {object}
 *         - constantRate
 *         - fordRate
 */
exports.getExcRate = async (fromCurrencyId, toCurrencyId, year, t) => {
  let $details = await models.currencyDetail.findAll({
    where: {
      currencyId: {$in: [fromCurrencyId, toCurrencyId]},
      year
    },
    transaction: t
  })
  let fromCurrency, toCurrency

  $details.forEach(detail => {
    if (detail.currencyId === fromCurrencyId) fromCurrency = detail
    if (detail.currencyId === toCurrencyId) toCurrency = detail
  })

  return {
    constantRate: NP.divide(fromCurrency.constantRateToUSD, toCurrency.constantRateToUSD),
    fordRate: NP.divide(fromCurrency.fordRateToUSD, toCurrency.fordRateToUSD),
  }
}

/**
 * 获取所有币种对 X 币种的汇率
 *
 * return  - allExcRate
 *            - fromCurrencyId
 *                - constantRate
 *                - fordRate
 */

async function getAllExcRate (toCurrencyId, year, t) {
  let $allCurrency = await models.currency.findAll({
    transaction: t
  })
  let allExcRate = {}

  for (let $fromCurrency of $allCurrency) {
    let excRate = await exports.getExcRate($fromCurrency.id, toCurrencyId, year, t)

    allExcRate[$fromCurrency.id] = excRate
  }

  return allExcRate
}
exports.getAllExcRate = getAllExcRate


/**
 * 将 money 中的钱，从 fromCurrency 转换为 toCurrency
 * @param {object} moneys 全部都是钱
 * @param {number} excRate fromCurrency / toCurrency 的汇率
 * @param {string} fromCurrency 展示看一下
 * @param {string} toCurrency 展示看一下
 * @return {object} 返回换算后的 moneys
 */
exports.exchangeMoney = (moneys, excRate, fromCurrency, toCurrency) => {
  for (let key in moneys) {
    if (typeof moneys[key] === 'number') {
      moneys[key] = NP.divide(moneys[key], excRate).simpleFixed(0)
    }
  }
  return moneys
}
