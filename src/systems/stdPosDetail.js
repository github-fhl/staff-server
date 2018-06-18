const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  Project = require('../../components/widgets/index').Project

const
  resCfg = {
    remove: ['salaryType']
  },
  attrMainCfg = ['id', 'stdPosId', 'skillLevel', 'year'],
  attrPriceCfg = ['id', 'stdPosDetailId', 'salaryTypeId', 'amount'],
  attrSalaryCfg = ['id', 'category', 'distributeType', 'location', 'index']

exports.new = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    ...Arg.factory(models.stdPosDetail),
    new Arg('stdPosPrices', true)
  ]

  if (!api.setArgs(args)) return

  let run = async t => {
    let countSow = await models.sow.count({
      where: {year: parseInt(api.args.year) + 1},
      transaction: t
    })

    if (countSow !== 0) throw new Error(`${parseInt(api.args.year) + 1} 年度已存在 SOW，不可创建`)

    // 同年只能有一条 stdPosDetail
    let condition = {
      stdPosId: api.args.stdPosId,
      year: api.args.year,
      skillLevel: api.args.skillLevel
    }

    await Project.checkUnique(models.stdPosDetail, condition, t)

    // stdPos 中只能有 salary、cola，不能有 bonus

    let $stdPosDetail = await models.stdPosDetail.create(api.args, {transaction: t})

    api.args.stdPosPrices.forEach(stdPosPrice => stdPosPrice.stdPosDetailId = $stdPosDetail.id)
    await models.stdPosPrice.bulkCreate(api.args.stdPosPrices, {transaction: t})

    let $result = await getStdPosDetail($stdPosDetail.id, t)

    return $result
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send(resCfg)
    })
    .catch(err => api.error(err))
}

// stdPos 对应年份如果存在 SOW 就不允许进行编辑了
exports.update = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true),
    new Arg('stdPosPrices', true)
  ]

  if (!api.setArgs(args)) return

  let run = async t => {
    let $stdPosDetail = await models.stdPosDetail.findOne({
      where: {id: api.args.id},
      attributes: attrMainCfg,
      transaction: t
    })

    if (!$stdPosDetail) throw new Error(`${api.args.id} 不存在`)

    let countSow = await models.sow.count({
      where: {year: $stdPosDetail.year + 1},
      transaction: t
    })

    if (countSow !== 0) throw new Error(`${$stdPosDetail.year + 1} 年度已存在 SOW，不可编辑`)

    await models.stdPosPrice.destroy({
      where: {stdPosDetailId: api.args.id},
      transaction: t
    })

    api.args.stdPosPrices.forEach(stdPosPrice => stdPosPrice.stdPosDetailId = api.args.id)
    await models.stdPosPrice.bulkCreate(api.args.stdPosPrices, {transaction: t})

    let $result = await getStdPosDetail(api.args.id, t)

    return $result
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send(resCfg)
    })
    .catch(err => api.error(err))
}

/**
 *
 * @param id
 * @param t
 * @returns {Promise.<*>}
 */

async function getStdPosDetail (id, t) {
  let $stdPosDetail = await models.stdPosDetail.findOne({
    where: {id},
    transaction: t,
    attributes: attrMainCfg,
    include: [{
      model: models.stdPosPrice,
      attributes: attrPriceCfg,
      separate: true,
      order: [[models.salaryType, 'index', 'ASC']],
      include: [{
        model: models.salaryType,
        attributes: attrSalaryCfg,
      }]
    }]
  })

  return $stdPosDetail
}
