const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {RMB} = require('config').get('args')

exports.create = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('increasePools', true)
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  let increaseMonths = args.increasePools.map(increasePool => {
    increasePool.currencyId = RMB

    return increasePool.increaseMonth
  })

  await models.increasePool.destroy({
    transaction: t,
    where: {increaseMonth: {$in: increaseMonths}}
  })

  await models.increasePool.bulkCreate(args.increasePools, {transaction: t})
}
