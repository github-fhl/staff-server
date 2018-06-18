const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrTransfer, JSONkeyTransferArr, attrFlowLog} = require('../args'),
  {positionLogStatus} = require('config').flowCfg,
  parseJSON = require('../commonFn/parseJSON')

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send({
          dateFormat: ['YYYY-MM-DD', 'transferDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $transfer = await models.transfer.findById(args.id, {
    attributes: attrTransfer,
    include: [{
      model: models.positionLog,
      attributes: ['id', 'name', 'wasStaffName', 'location'],
      as: 'inLog',
      include: [{
        model: models.position,
        attributes: ['name']
      }]
    }, {
      model: models.positionLog,
      attributes: ['id', 'name', 'wasStaffName', 'location'],
      as: 'outLog',
      include: [{
        model: models.position,
        attributes: ['name']
      }]
    }, {
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })

  if (!$transfer) throw new Error(`${args.id} 不存在`)
  let $position = await models.positionLog.findAll({
    where: {flowStatus: positionLogStatus.Open},
    attributes: ['id', 'name']
  })

  $transfer.dataValues.position = $position;
  parseJSON($transfer.dataValues, JSONkeyTransferArr)
  return $transfer
}
