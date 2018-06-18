const
  {ProjectMachine} = require('./projectMachine'),
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../../models/index'),
  {attrProject, attrFlowLog} = require('../../args'),
  {collectPO} = require('config').get('flowCfg').projectOperation

let flow = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true),
    new Arg('remark', false)
  ]
  let handle = req.path.split('/')[1]

  /**
   * POInfo
   *      - poCode
   *      - fee
   *      - productionCost
   *      - poFilePath
   */
  if (handle === collectPO) receiveArgs.push(new Arg('POInfo', true))
  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, req.user, handle, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, user, handle, t) {
  let $project = await models.project.findById(args.id, {
    attributes: attrProject,
    transaction: t
  })

  if (!$project) throw new Error(`${args.id} 不存在`)

  let machine = await (new ProjectMachine($project, user, t)).init()

  if (handle === collectPO) await machine[handle](args.POInfo)
  else await machine[handle]()
}

module.exports = {
  ProjectMachine,
  flow
}
