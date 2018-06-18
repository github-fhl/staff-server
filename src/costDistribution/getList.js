const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrCostDistribution} = require('../args')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('costCenterId', true)
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
  let $costDistributions = await models.costDistribution.findAll({
    attributes: attrCostDistribution,
    where: {
      costCenterId: args.costCenterId
    },
    include: [{
      model: models.position,
      attributes: ['id', 'name'],
      as: 'position'
    }]
  })

  return $costDistributions
}
