const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrDataLog} = require('../args')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('dataLogType', true)
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
  let $dataLogs = await models.dataLog.findAll({
    where: {
      dataLogType: args.dataLogType
    },
    attributes: attrDataLog
  })

  return $dataLogs
}
