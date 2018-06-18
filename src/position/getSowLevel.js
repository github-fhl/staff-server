const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  cfg = require('config').get('args'),
  NP = require('number-precision'),
  {getExcRate} = require('../systems/currency')

exports.getSowLevel = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('directComp', true),
    new Arg('currencyId', true),
    new Arg('year', true), // position 的年份
  ]

  if (!api.setArgs(receiveArgs)) return

  querySowLevel(api.args.directComp, api.args.currencyId, parseInt(api.args.year) - 1)
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}


/**
 * 根据 directComp 的金额，去对比 sowLevel，从而得出当前金额位于什么 level
 * @param {number} directComp - directComp 的金额
 * @param {string} currencyId -  directComp 的币种
 * @param {string} year  - sowLevel 的生效年份，所以 position 的 year 需要减 1
 * @param {object} t  - transaction
 * @return {string} level 返回 sow 的 level 值
 */
async function querySowLevel (directComp, currencyId, year, t) {
  let $sowLevel = await models.sowLevel.findOne({
    where: {year},
    transaction: t
  })

  if (!$sowLevel) throw new Error(`${year} 年的 SOW Level 不存在`)

  let {fordRate} = await getExcRate(currencyId, $sowLevel.currencyId, year, t)
  let directCompExchanged = NP.divide(directComp, fordRate)
  let level

  if (directCompExchanged <= $sowLevel.level1Max) level = cfg.sowLevelType.level1
  else if (directCompExchanged <= $sowLevel.level2Max) level = cfg.sowLevelType.level2
  else if (directCompExchanged <= $sowLevel.level3Max) level = cfg.sowLevelType.level3
  else if (directCompExchanged <= $sowLevel.level4Max) level = cfg.sowLevelType.level4
  else level = cfg.sowLevelType.level5

  return level
}

exports.querySowLevel = querySowLevel
