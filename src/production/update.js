const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {attrProduction} = require('../args')

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.production, 'put')

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
  let $production = await models.production.findById(args.id, {
    transaction: t,
    attributes: attrProduction
  })

  Object.assign($production, args)

  await $production.save({transaction: t})
  return $production
}
