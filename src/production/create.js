const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {Running} = require('config').get('flowCfg').productionStatus

exports.create = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.production)

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, t))
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  args.flowStatus = Running

  let $production = await models.production.create(args, {transaction: t})

  return $production
}
