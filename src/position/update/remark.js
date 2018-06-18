const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../../models/index')


const updateRemark = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true),
    new Arg('remark')
  ]

  if (!api.setArgs(receiveArgs)) return

  let run = async (args, t) => {
    let $position = await models.position.findOne({
      where: {id: args.id},
      transaction: t
    })

    if (!$position) throw new Error(`${args.id} 不存在`)

    await $position.update({remark: args.remark}, {transaction: t})
  }

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.updateRemark = updateRemark
