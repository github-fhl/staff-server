const
  {ExtensionMachine} = require('./extensionMachine'),
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../../models/index'),
  {attrExtension, attrFlowLog, JSONkeyExtensionArr} = require('../../args'),
  {extend} = require('config').get('flowCfg').extensionOperation,
  parseJSON = require('../../commonFn/parseJSON')

let flow = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true),
    new Arg('remark', false)
  ]
  let handle = req.path.split('/')[1]

  /**
   * staffInfo
   *  - entryDate 入职日期
   *  - leaveDate 离职日期
   */
  if (handle === extend) receiveArgs.push(new Arg('staffInfo', true))
  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, req.user, handle, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'leaveDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args, user, handle, t) {
  let $extension = await models.extension.findById(args.id, {
    attributes: attrExtension,
    transaction: t
  })

  if (!$extension) throw new Error(`${args.id} 不存在`)
  parseJSON($extension, JSONkeyExtensionArr)

  let machine = await (new ExtensionMachine($extension, user, t)).init()

  if (handle === extend) await machine[handle](args.staffInfo)
  else await machine[handle]()

  $extension = await models.extension.findOne({
    transaction: t,
    where: {id: $extension.id},
    attributes: attrExtension,
    include: [{
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })
  parseJSON($extension.dataValues, JSONkeyExtensionArr)
  return $extension
}

module.exports = {
  ExtensionMachine,
  flow
}
