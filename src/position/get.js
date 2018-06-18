const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrPosition, sowResCfg, attrSowPosition} = require('../args'),
  {N, clientType} = require('config').get('args')

const
  attrSow = ['id', 'name', 'version', 'clientId', 'sowType', 'flowStatus']

const get = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true),
    new Arg('isExecution', false, null, N)
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
  let $position = await models.position.findOne({
    where: {id: args.id},
    attributes: attrPosition,
    include: [{
      model: models.sowPosition,
      required: false,
      separate: true,
      where: {status: args.isExecution === N ? 1 : 2},
      attributes: attrSowPosition,
      include: [{
        model: models.sow,
        attributes: attrSow
      }],
      order: [[models.sow, 'clientId', 'ASC']]
    }, {
      model: models.staff,
      attributes: ['id', 'name']
    }]
  })

  if (!$position) throw new Error(`${args.id} 不存在`)
  $position.dataValues.sowPositions.sort(($a, $b) => {
    if ($a.sow.sowType === clientType.InHouse) return true
    return false
  })

  if (!$position) throw new Error(`${args.id} 不存在`)

  return $position
}

exports.get = get
