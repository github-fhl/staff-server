const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {calculateProductionBalance} = require('./getList')

exports.getProductionBalance = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $production = await models.production.findById(args.id)
  let $productions = await calculateProductionBalance({id: args.id}, [$production.year])

  $production = {
    id: $productions[0].id,
    balance: $productions[0].dataValues.balance
  }

  return $production
}
