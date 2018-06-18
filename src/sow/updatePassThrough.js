const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {attrSow} = require('../args')


let updatePassThrough = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true),
    new Arg('otherFee', true)
  ]

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  let $sow = await models.sow.findOne({
    where: {id: args.id},
    transaction: t,
    attributes: attrSow
  })

  if (!$sow) throw new Error(`${args.id} 不存在`)

  await $sow.update({otherFee: args.otherFee}, {transaction: t})
  return $sow
}

exports.updatePassThrough = updatePassThrough
