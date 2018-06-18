const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  Project = require('../../components/widgets/index').Project

exports.new = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.officeDetail)

  if (!api.setArgs(args)) return

  let run = async t => {
    // 同年只能有一条 officeDetail
    let condition = {
      officeId: api.args.officeId,
      year: api.args.year
    }

    await Project.checkUnique(models.officeDetail, condition, t)

    let $officeDetail = await models.officeDetail.create(api.args, {transaction: t})

    return $officeDetail
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
  let args = Arg.factory(models.officeDetail, 'put')

  if (!api.setArgs(args)) return

  let run = async t => {
    let $officeDetail = await models.officeDetail.findOne({
      where: {id: api.args.id},
      transaction: t
    })

    if (!$officeDetail) throw new Error(`${api.args.id} 不存在`)

    api.args.year = $officeDetail.year
    await $officeDetail.update(api.args, {transaction: t})

    return $officeDetail
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
