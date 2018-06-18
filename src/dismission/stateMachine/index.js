const
  {DismissionMachine} = require('./dismissionMachine'),
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../../models/index'),
  {dismiss} = require('config').get('flowCfg').dismissionOperation,
  {attrDismission, attrFlowLog} = require('../../args')

let flow = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true),
    new Arg('remark', false)
  ]
  let handle = req.path.split('/')[1]

  if (handle === dismiss) receiveArgs.push(
    new Arg('leaveDate', true),
    new Arg('stopPayDate', true),
  )

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, req.user, handle, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send({
          dateFormat: ['YYYY-MM-DD', 'applicationDate', 'leaveDate', 'stopPayDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args, user, handle, t) {
  let $dismission = await models.dismission.findById(args.id, {
    attributes: attrDismission,
    transaction: t
  })

  if (!$dismission) throw new Error(`${args.id} 不存在`)

  let machine = await (new DismissionMachine($dismission, user, t)).init()

  if (handle === dismiss) await machine[handle](args.leaveDate, args.stopPayDate)
  else await machine[handle]()

  $dismission = await models.dismission.findOne({
    transaction: t,
    where: {id: $dismission.id},
    attributes: attrDismission,
    include: [{
      model: models.positionLog,
      attributes: ['name']
    }, {
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })
  return $dismission
}

module.exports = {
  DismissionMachine,
  flow
}
