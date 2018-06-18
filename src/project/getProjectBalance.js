const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {calculateProjectBalance} = require('./getList')

exports.getProjectBalance = (req, res) => {
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
  let $project = await models.project.findById(args.id)
  let $projects = await calculateProjectBalance({id: args.id}, [$project.year])

  $project = {
    id: $projects[0].id,
    name: $projects[0].name,
    balance: $projects[0].dataValues.balance
  }

  return $project
}
