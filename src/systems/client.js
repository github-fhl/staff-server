const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index')

const
  resCfg = {
    remove: ['ClientTeam']
  },
  attrMainCfg = ['id', 'brief', 'contact', 'address', 'telephone', 'email', 'type', 'incentiveRate', 'taxDiscountRate'],
  attrDetailCfg = ['id', 'name', 'brief']

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)

  getClients(api)
    .then(objs => {
      api
        .setResponse(objs)
        .send(resCfg)
    })
    .catch(err => api.error(err))
}

/**
 *
 * @param {object} api 参数
 * @returns {Promise.<{rows: *, count}>}
 */
async function getClients (api) {

  let $clients = await models.client.findAll({
    attributes: attrMainCfg,
    order: 'id ASC',
    include: [{
      model: models.team,
      attributes: attrDetailCfg
    }]
  })

  return {rows: $clients, count: $clients.length}
}
exports.getClients = getClients

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return


  let run = async () => {
    let $client = await models.client.findOne({
      where: {
        id: api.args.id
      },
      attributes: attrMainCfg,
      include: [{
        model: models.team,
        attributes: attrDetailCfg
      }]
    })

    return $client
  }

  run()
    .then(obj => {
      api
        .setResponse(obj)
        .send(resCfg)
    })
    .catch(err => api.error(err))
}

exports.new = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.client)

  if (!api.setArgs(args)) return

  let run = async t => {
    let $client = await models.client.create(api.args, {transaction: t})

    return $client
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send(resCfg)
    })
    .catch(err => api.error(err))
}

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.client, 'put')

  if (!api.setArgs(args)) return

  let run = async t => {
    let $client = await models.client.findOne({
      where: {id: api.args.id},
      attributes: attrMainCfg,
      transaction: t
    })

    if (!$client) throw new Error(`${api.args.id} 不存在`)

    await $client.update(api.args, {transaction: t})

    return $client
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send(resCfg)
    })
    .catch(err => api.error(err))
}
