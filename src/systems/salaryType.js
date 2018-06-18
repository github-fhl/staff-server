const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {Regular} = require('config').get('args').staffType

const
  attrMainCfg = ['id', 'staffType', 'category', 'distributeType', 'location', 'index']


exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('staffType', false),
  ]

  if (!api.setArgs(args)) return

  getSalaryTypes(api)
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
async function getSalaryTypes (api) {
  let $salaryTypes = await models.salaryType.findAll({
    where: {staffType: api.args.staffType || Regular},
    attributes: attrMainCfg,
    order: [['index', 'ASC']]
  })

  return {rows: $salaryTypes, count: $salaryTypes.length}
}

exports.getSalaryTypes = getSalaryTypes

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return


  let run = async () => {
    let $salaryType = await models.salaryType.findOne({
      where: {
        id: api.args.id
      },
      attributes: attrMainCfg
    })

    return $salaryType
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
  let args = Arg.factory(models.salaryType)

  if (!api.setArgs(args)) return

  let run = async t => {
    let count = await models.salaryType.count({transaction: t})

    api.args.index = count + 1
    let $salaryType = await models.salaryType.create(api.args, {transaction: t})

    return $salaryType
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.updateIndex = (req, res) => {
  let api = new ApiDialect(req, res)
  // ids : ['salaryTypeId1', 'salaryTypeId1']
  let args = [
    new Arg('ids', true)
  ]

  if (!api.setArgs(args)) return

  let run = async t => {
    if (api.args.ids.length !== 2) throw new Error('需要有两个 id')

    let $salaryType0 = await models.salaryType.findOne({
      where: {id: api.args.ids[0]},
      transaction: t
    })
    let index0 = $salaryType0.index
    let $salaryType1 = await models.salaryType.findOne({
      where: {id: api.args.ids[1]},
      transaction: t
    })
    let index1 = $salaryType1.index

    let indexFlag;
    let where = {};

    if (index0 > index1) {
      indexFlag = 1;
      where.index = {
        $gte: index1,
        $lt: index0
      }
    } else if (index0 < index1) {
      indexFlag = -1;
      where.index = {
        $gt: index0,
        $lte: index1
      }
    }

    let $salaryTypes = await models.salaryType.findAll({
      where,
      transaction: t
    })

    for (let $salaryType of $salaryTypes) {
     await $salaryType.update({index: $salaryType.index + indexFlag}, {transaction: t})
    }

    await $salaryType0.update({index: index1}, {transaction: t})
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
