const
  {ApiDialect} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrTransfer, JSONkeyTransferArr, attrFlowLog} = require('../args'),
  {parseJSON} = require('../commonFn')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
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
  let $transfers = await models.transfer.findAll({
    attributes: attrTransfer,
    include: [{
      model: models.positionLog,
      attributes: ['id', 'name', 'location'],
      as: 'inLog'
    }, {
      model: models.positionLog,
      attributes: ['id', 'name', 'location'],
      as: 'outLog'
    }, {
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })

  for (let $transfer of $transfers) {
    parseJSON($transfer.dataValues, JSONkeyTransferArr)
  }

  return $transfers
}
