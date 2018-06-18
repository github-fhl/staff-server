const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  cfg = require('config').get('args'),
  Project = require('../../components/widgets/index').Project

const
  attrCfg = ['id', 'year', 'rate', 'max', 'min', 'companyId']

exports.new = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.companyDetail)

  if (!api.setArgs(args)) return

  let run = async t => {
    api.args.payorType = cfg.payorType.Company

    // 同年只能有一条 companyDetail
    let condition = {
      companyId: api.args.companyId,
      year: api.args.year,
      payorType: api.args.payorType
    }

    await Project.checkUnique(models.companyDetail, condition, t)

    let $companyDetail = await models.companyDetail.create(api.args, {transaction: t})

    return $companyDetail
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
  let args = Arg.factory(models.companyDetail, 'put')

  if (!api.setArgs(args)) return

  let run = async t => {

    let $companyDetail = await models.companyDetail.findOne({
      where: {id: api.args.id},
      attributes: attrCfg,
      transaction: t
    })

    if (!$companyDetail) throw new Error(`${api.args.id} 不存在`)

    api.args.year = $companyDetail.year
    await $companyDetail.update(api.args, {transaction: t})

    return $companyDetail
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
