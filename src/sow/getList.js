const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {cfg} = require('config'),
  {clientType, N} = cfg,
  {getCurrencys} = require('../systems/currency'),
  {attrSow, attrLevel} = require('../args'),
  getPassThrough = require('../../app/service/passThrough/get'),
  _ = require('lodash'),
  redis = require('redis'),
  {redisCfg, eventType} = require('config'),
  pub = redis.createClient(redisCfg.port, redisCfg.host)

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', false),
    new Arg('isExecution', false, null, N)
  ]

  if (!api.setArgs(args)) return

  run(api, req.user)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (api, user) {
  let results = {}
  let year = parseInt(api.args.year || (new Date()).getFullYear() + 1)

  let $soldSows = await models.sow.findAll({
    where: {
      sowType: clientType.Sold,
      year,
      isExecution: api.args.isExecution
    },
    attributes: attrSow,
    order: [
      ['name', 'ASC'], ['version', 'ASC']
    ]
  })

  // pub.publish(eventType.submitSoW, JSON.stringify({
  //   fromUserId: user.id,
  //   sowId: $soldSows[0].id
  // }))

  let soldSowsField = [];

  for (let $soldSow of $soldSows) {
    $soldSow.otherFee = JSON.parse($soldSow.otherFee)
    if (!$soldSow.otherFee) {
      $soldSow.otherFee = await getPassThrough();
    }

    $soldSow.otherFee.forEach(item => {
      soldSowsField.push(item.name)
    })
  }
  soldSowsField = _.uniq(soldSowsField);
  results.soldSows = {rows: $soldSows, count: $soldSows.length, field: soldSowsField}

  let $specialSows = await models.sow.findAll({
    where: {
      sowType: {$ne: clientType.Sold},
      year,
      isExecution: api.args.isExecution
    },
    attributes: attrSow
  })
  let specialSowsField = [];

  for (let $specialSow of $specialSows) {
    $specialSow.otherFee = JSON.parse($specialSow.otherFee)
    if (!$specialSow.otherFee) {
      $specialSow.otherFee = await getPassThrough();
    }

    $specialSow.otherFee.forEach(item => {
      specialSowsField.push(item.name)
    })
  }
  specialSowsField = _.uniq(specialSowsField)
  results.specialSows = {rows: $specialSows, count: $specialSows.length, field: specialSowsField}

  results.sowLevel = await models.sowLevel.findOne({
    where: {year: year - 1},
    attributes: attrLevel
  })

  results.currencys = (await getCurrencys(year)).rows
  if (results.currencys[0].currencyDetails.length === 0) {
    results.currencys = (await getCurrencys(year - 1)).rows
  }
  return results
}
