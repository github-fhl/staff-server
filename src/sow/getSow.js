const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrSow} = require('../args')

exports.getSow = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', true),
    new Arg('isExecution', true),
    new Arg('sowType', true),
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
  let year = parseInt(args.year)

  let $sows = await models.sow.findAll({
    where: {
      sowType: args.sowType,
      year,
      isExecution: args.isExecution
    },
    attributes: attrSow
  })

  $sows.forEach($sow => {
      $sow.otherFee = JSON.parse($sow.otherFee)
    })
  return $sows
}
