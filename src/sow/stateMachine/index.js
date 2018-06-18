const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../../models/index'),
  {SowMachine} = require('./sowMachine'),
  {collectPO} = require('config').flowCfg.sowOperation,
  {Y, N} = require('config').get('args'),
  {checkExist} = require('../../../components/widgets')

let flow = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true)
  ]
  let handle = req.path.split('/')[1]

  if (handle === collectPO) receiveArgs.push(new Arg('clientPos', true))
  if (!api.setArgs(receiveArgs)) return

  if (handle === collectPO) {
    api.args.clientPos.forEach(clientPo => {
      checkExist(clientPo, ['name', 'filePath', 'currencyId', 'total'])
      clientPo.sowId = api.args.id
    })
  }

  sequelize.transaction(t => run(api.args, req.user, handle, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, user, handle, t) {
  let $sow = await models.sow.findOne({
    where: {id: args.id},
    transaction: t
  })

  if (!$sow) throw new Error(`${args.id} 不存在`)
  if ($sow.isExecution === Y) throw new Error(`${$sow.name} 为执行版本，不能进行审批操作`)
  await (new SowMachine($sow, user, t)).init()[handle](args.clientPos)
  return $sow
}

exports.flow = flow
