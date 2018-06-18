const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  Project = require('../../components/widgets/index').Project,
  cfg = require('config').get('args'),
  NP = require('number-precision')

const
  attrMainCfg = ['id', 'constantRateToUSD', 'fordRateToUSD', 'constantRateToRMB', 'fordRateToRMB', 'year', 'currencyId']

exports.new = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.currencyDetail)

  if (!api.setArgs(args)) return

  let run = async t => {
    // 同年只能有一条 currencyDetail
    let condition = {
      currencyId: api.args.currencyId,
      year: api.args.year
    }

    await Project.checkUnique(models.currencyDetail, condition, t)

    let toRMBRate = api.args.currencyId !== cfg.RMB ?
      await getToRMBRate(api.args.constantRateToUSD, api.args.fordRateToUSD, api.args.year, t) :
      {constantRateToRMB: 1, fordRateToRMB: 1}

    api.args.constantRateToRMB = toRMBRate.constantRateToRMB
    api.args.fordRateToRMB = toRMBRate.fordRateToRMB

    let $currencyDetail = await models.currencyDetail.create(api.args, {transaction: t})

    return $currencyDetail
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.currencyDetail, 'put')

  if (!api.setArgs(args)) return

  let run = async t => {
    let $currencyDetail = await models.currencyDetail.findOne({
      where: {id: api.args.id},
      attributes: attrMainCfg,
      transaction: t
    })

    if (!$currencyDetail) throw new Error(`${api.args.id} 不存在`)

    let toRMBRate

    api.args.year = $currencyDetail.year
    if ($currencyDetail.currencyId === cfg.RMB) {
      api.args.constantRateToRMB = 1
      api.args.fordRateToRMB = 1
      await $currencyDetail.update(api.args, {transaction: t})
      await reCalculateToRMBRate($currencyDetail.year, t)
    }
    else {
      toRMBRate = await getToRMBRate(api.args.constantRateToUSD, api.args.fordRateToUSD, api.args.year, t)

      api.args.constantRateToRMB = toRMBRate.constantRateToRMB
      api.args.fordRateToRMB = toRMBRate.fordRateToRMB
      await $currencyDetail.update(api.args, {transaction: t})
    }
    return $currencyDetail
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
 * 编辑 RMB => USD 的汇率时，需要更新其它币种的汇率
 * 1. 获取当年其余币种的汇率
 * 2. 根据 RMB 的新汇率重新进行计算
 *
 * @param {number} year 年份
 * @param {object} t transaction
 * @returns {null}
 */
async function reCalculateToRMBRate (year, t) {
  let $otherCurrencyRates = await models.currencyDetail.findAll({
    transaction: t,
    where: {
      year,
      currencyId: {$ne: cfg.RMB}
    }
  })

  for (let $otherCurrencyRate of $otherCurrencyRates) {
    let toRMBRate = await getToRMBRate($otherCurrencyRate.constantRateToUSD, $otherCurrencyRate.fordRateToUSD, $otherCurrencyRate.year, t)

    await $otherCurrencyRate.update(toRMBRate, {transaction: t})
  }
}


/**
 * 根据一个币种对 USD 的汇率，获得对 RMB 的汇率
 *
 * @param {number} constantRateToUSD  币种对 USD 的 内部汇率
 * @param {number} fordRateToUSD  币种对 USD 的客户汇率
 * @param {string} year 年份
 * @param {object} t transaction
 * @return {object}
 */
async function getToRMBRate (constantRateToUSD, fordRateToUSD, year, t) {
  let $RMBDetail = await models.currencyDetail.findOne({
    where: {
      currencyId: cfg.RMB,
      year
    },
    transaction: t
  })

  if (!$RMBDetail) throw new Error(`${year} 年 ${cfg.RMB} 的汇率不存在`)
  let constantRateToRMB = NP.divide(constantRateToUSD, $RMBDetail.constantRateToUSD)
  let fordRateToRMB = NP.divide(fordRateToUSD, $RMBDetail.fordRateToUSD)

  return {constantRateToRMB, fordRateToRMB}
}

