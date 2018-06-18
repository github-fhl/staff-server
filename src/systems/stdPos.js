const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  cfg = require('config').get('args'),
  moment = require('moment')

const
  resCfg = {
    remove: ['salaryType']
  },
  attrMainCfg = ['id', 'name', 'teamId', 'location', 'officeId', 'currencyId'],
  attrDetailCfg = ['id', 'stdPosId', 'skillLevel', 'year'],
  attrPriceCfg = ['id', 'stdPosDetailId', 'salaryTypeId', 'amount'],
  attrSalaryCfg = ['id', 'category', 'distributeType', 'location', 'index'],
  attrTeam = ['id', 'name', 'brief']


exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', false)
  ]

  if (!api.setArgs(args)) return

  getStdPoss(api)
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
async function getStdPoss (api) {
  let $stdPosList = await models.stdPos.findAll({
    attributes: attrMainCfg,
    include: [{
      model: models.stdPosDetail,
      attributes: attrDetailCfg,
      required: false,
      order: [
        sequelize.fn('FIELD', sequelize.col('stdPosDetail.skillLevel'), 'Low', 'Middle', 'High'),
      ],
      where: {year: api.args.year || (new Date()).getFullYear()},
      separate: true,
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
    }, {
      model: models.team,
      attributes: attrTeam
    }],
    order: [['officeId', 'ASC'], ['name', 'ASC']]
  })

  return {rows: $stdPosList, count: $stdPosList.length}
}
exports.getStdPoss = getStdPoss

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return


  let run = async () => {
    let $stdPoss = await models.stdPos.findOne({
      where: {id: api.args.id},
      attributes: attrMainCfg,
      include: [{
        model: models.stdPosDetail,
        attributes: attrDetailCfg,
        required: false,
        separate: true,
        order: [
          ['year', 'ASC'],
          sequelize.fn('FIELD', sequelize.col('stdPosDetail.skillLevel'), 'Low', 'Middle', 'High'),
        ],
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
      }, {
        model: models.team,
        attributes: attrTeam
      }]
    })

    if (!$stdPoss) throw new Error(`${api.args.id} 不存在`)
    return $stdPoss
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
  let args = Arg.factory(models.stdPos)

  if (!api.setArgs(args)) return

  let run = async t => {
    let count = await models.stdPos.count({
      where: {
        name: api.args.name,
        teamId: api.args.teamId,
        location: api.args.location,
        officeId: api.args.officeId,
      }
    })

    if (count !== 0) throw new Error('该数据已存在')
    let $stdPos = await models.stdPos.create(api.args, {transaction: t})

    for (let level of Object.values(cfg.skillLevelType)) {
      let stdPosDetail = {
        stdPosId: $stdPos.id,
        skillLevel: level,
        year: moment().year()
      }
      let $stdPosDetail = await models.stdPosDetail.create(stdPosDetail, {transaction: t})
      let stdPosPrice = {
        stdPosDetailId: $stdPosDetail.id,
        salaryTypeId: cfg.salaryType['Monthly Salary'],
        amount: 0
      }

      await models.stdPosPrice.create(stdPosPrice, {transaction: t})
    }

    return $stdPos
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send(resCfg)
    })
    .catch(err => api.error(err))
}
