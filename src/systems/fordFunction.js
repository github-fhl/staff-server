const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index')

const
  attrMainCfg = ['id', 'status', 'group']

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', false),
    new Arg('status', false),
    new Arg('group', false)
  ]

  if (!api.setArgs(args)) return

  getFordFunctions(api)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 *
 * @param {object} api 参数
 * @returns {Promise.<{rows: *, count}>}
 */
async function getFordFunctions (api) {
  let where = {}

  if (api.args.id) {
    where.id = api.args.id;
  }
  if (api.args.status) {
    where.status = api.args.status;
  }
  if (api.args.group) {
    where.group = api.args.group;
  }
  let opt = {
    where,
    order: [['group', 'asc'], ['createdAt', 'asc']]
  }
  let $fordFunctions = await models.fordFunction.findAll(opt);

  return {rows: $fordFunctions, count: $fordFunctions.length}
}

exports.getFordFunctions = getFordFunctions

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return


  let run = async () => {
    let $fordFunction = await models.fordFunction.findOne({
      where: {
        id: api.args.id
      },
      attributes: attrMainCfg
    })

    return $fordFunction
  }

  run()
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.new = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return

  let run = async t => {
    let group = await models.fordFunction.max('group', {transaction: t});

    let $fordFunction = await models.fordFunction.create({
      id: api.args.id,
      group: group + 1,
      status: 1
    }, {transaction: t})

    return $fordFunction
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.delete = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return

  let run = async t => {
    let $fordFunction = await models.fordFunction.findOne({
      where: {id: api.args.id},
      attributes: attrMainCfg,
      transaction: t
    })

    if (!$fordFunction) throw new Error(`${api.args.id} 不存在`)

    await $fordFunction.update({status: 0}, {transaction: t})

    return $fordFunction
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.enable = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return

  let run = async t => {
    let $fordFunction = await models.fordFunction.findOne({
      where: {id: api.args.id},
      attributes: attrMainCfg,
      transaction: t
    })

    if (!$fordFunction) throw new Error(`${api.args.id} 不存在`)

    await models.fordFunction.update({status: 0}, {where: {group: $fordFunction.group}, transaction: t});

    await $fordFunction.update({status: 1}, {transaction: t})

    return $fordFunction
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
