const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {getCurrencys} = require('../systems/currency'),
  {getOffices} = require('../systems/office'),
  {attrSow, attrPosition, sowResCfg} = require('../args'),
  getPassThrough = require('../../app/service/passThrough/get')

const get = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true)
  ]

  if (!api.setArgs(receiveArgs)) return

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send(sowResCfg)
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let result = {}

  let $sow = await models.sow.findOne({
    where: {id: args.id},
    include: [{
      model: models.position,
      attributes: attrPosition,
      include: [{
        model: models.staff,
        attributes: ['id', 'name']
      }]
    }],
    attributes: attrSow
  })

  if (!$sow) throw new Error(`${args.id} 不存在`)

  $sow.otherFee = JSON.parse($sow.otherFee);

  if (!$sow.otherFee) {
    $sow.otherFee = await getPassThrough();
  }
  let field = [];

  $sow.otherFee.forEach(item => {
    field.push(item.name)
  })

  result.field = field
  result.sow = $sow
  result.currencys = (await getCurrencys($sow.year)).rows
  if (result.currencys[0].currencyDetails.length === 0) {
    result.currencys = (await getCurrencys($sow.year - 1)).rows
  }

  result.offices = (await getOffices({args: {year: $sow.year - 1}})).rows

  return result
}

exports.get = get
