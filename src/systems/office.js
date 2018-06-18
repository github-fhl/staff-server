const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  moment = require('moment')

const
  attrMainCfg = ['id', 'contact', 'address', 'telephone', 'email', 'currencyId'],
  attrDetailCfg = ['id', 'year', 'mulRate', 'dictRate', 'incRate', 'benRate', 'overRate', 'mkpRate', 'taxRate', 'invRate', 'divRate', 'officeId']


exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', false)
  ]

  if (!api.setArgs(args)) return

  getOffices(api)
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
async function getOffices (api) {
  let $offices = await models.office.findAll({
    attributes: attrMainCfg,
    order: 'id ASC',
    include: [{
      model: models.officeDetail,
      required: false,
      attributes: attrDetailCfg,
      where: {
        year: api.args.year || (new Date()).getFullYear(),
      },
    }]
  })

  return {rows: $offices, count: $offices.length}
}
exports.getOffices = getOffices

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return


  let run = async () => {
    let $office = await models.office.findOne({
      where: {
        id: api.args.id
      },
      attributes: attrMainCfg,
      include: [{
        model: models.officeDetail,
        required: false,
        attributes: attrDetailCfg,
        separate: true,
        order: 'year ASC'
      }]
    })

    return $office
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
  let args = Arg.factory(models.office)

  if (!api.setArgs(args)) return

  let run = async t => {

    let $office = await models.office.create(api.args, {transaction: t})
    let officeDetail = {
      year: moment().year(),
      officeId: $office.id
    }

    await models.officeDetail.create(officeDetail, {transaction: t})

    return $office
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.office, 'put')

  if (!api.setArgs(args)) return

  let run = async t => {
    let $office = await models.office.findOne({
      where: {id: api.args.id},
      attributes: attrMainCfg,
      transaction: t
    })

    if (!$office) throw new Error(`${api.args.id} 不存在`)

    await $office.update(api.args, {transaction: t})

    return $office
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
