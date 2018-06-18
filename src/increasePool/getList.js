const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrIncreasePool} = require('../args')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', true)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $increasePools = await models.increasePool.findAll({
    where: {
      increaseMonth: {$like: `${args.year}%`}
    },
    attributes: attrIncreasePool
  })

  return $increasePools
}
