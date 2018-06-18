const
  {TransferMachine} = require('./transferMachine'),
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../../models/index'),
  {attrTransfer, attrFlowLog, JSONkeyTransferArr} = require('../../args'),
  {transfer} = require('config').get('flowCfg').transferOperation,
  {parseJSON} = require('../../commonFn')

let flow = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true),
    new Arg('remark', false)
  ]
  let handle = req.path.split('/')[1]

  if (handle === transfer) receiveArgs.push(new Arg('transferDate', true), new Arg('contractFile', false))

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, req.user, handle, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send({
          dateFormat: ['YYYY-MM-DD', 'transferDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args, user, handle, t) {
  let $transfer = await models.transfer.findById(args.id, {
    attributes: attrTransfer,
    transaction: t
  })

  if (!$transfer) throw new Error(`${args.id} 不存在`)
  parseJSON($transfer, JSONkeyTransferArr)

  let machine = await (new TransferMachine($transfer, user, t)).init()

  if (handle === transfer) await machine[handle](args.transferDate, args.contractFile)
  else await machine[handle]()

  $transfer = await models.transfer.findOne({
    transaction: t,
    where: {id: $transfer.id},
    attributes: attrTransfer,
    include: [{
      model: models.positionLog,
      attributes: ['id', 'name'],
      as: 'inLog'
    }, {
      model: models.positionLog,
      attributes: ['id', 'name'],
      as: 'outLog'
    }, {
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })
  parseJSON($transfer.dataValues, JSONkeyTransferArr)
  return $transfer
}

module.exports = {
  TransferMachine,
  flow
}
