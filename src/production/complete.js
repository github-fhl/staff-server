const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {Completed} = require('config').get('flowCfg').productionStatus

exports.complete = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true),
  ]

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, t))
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  await models.production.update({
    flowStatus: Completed
  }, {
    transaction: t,
    where: {id: args.id}
  })
}
