const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  NP = require('number-precision'),
  {getExcRate} = require('../systems/currency'),
  {attrProject, attrProjectDetail} = require('../args'),
  {clientType, N, specialClients} = require('config').get('args'),
  {POCollected} = require('config').get('flowCfg').sowStatus

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $project = await models.project.findById(args.id, {
    attributes: attrProject,
    include: [{
      model: models.projectDetail,
      attributes: attrProjectDetail,
      include: [{
        model: models.team,
        attributes: ['name']
      }, {
        model: models.stdPos,
        as: 'stdPos',
        attributes: ['name']
      }],
      separate: true,
      order: [
        [models.team, 'name', 'ASC'],
        [{model: models.stdPos, as: 'stdPos'}, 'name', 'ASC'],
        sequelize.fn('FIELD', sequelize.col('projectDetail.skillLevel'), 'Low', 'Middle', 'High')
      ]
    }]
  })

  $project.dataValues.officeInfos = await distributeByOffice($project.projectDetails, $project)
  $project.dataValues.averageNet = await getAverageNets($project)

  return $project
}


/**
 * 将 projectDetail 按照 office 进行分类
 * 1. 获取汇率，转换为 project 的汇率
 * 2. 根据 officeId 分类
 */

async function distributeByOffice ($projectDetails, $project, t) {
  let offices = {}

  for (let $projectDetail of $projectDetails) {
    if (!offices[$projectDetail.officeId]) {
      offices[$projectDetail.officeId] = {
        officeId: $projectDetail.officeId,
        fordRate: 0,
        net: 0,
        taxRate: 0,
        tax: 0,
        gross: 0
      }
    }

    let {fordRate} = await getExcRate($projectDetail.currencyId, $project.currencyId, $project.year, t)

    offices[$projectDetail.officeId].taxRate = $projectDetail.taxRate
    offices[$projectDetail.officeId].fordRate = fordRate

    let keys = ['net', 'tax', 'gross']

    keys.forEach(key => {
      offices[$projectDetail.officeId][key] = NP.plus(NP.divide($projectDetail[key], fordRate), offices[$projectDetail.officeId][key])
    })
  }

  return Object.values(offices)
}

/**
 * 获取相关的平均 net 金额
 * 1. projectNet：project.net / project.FTE
 * 2. sowNet: 所有 project 年份的 sold sow，将币种转换后，得到平均 net
 * 3. 各 client 的 sow 的平均 net
 */

async function getAverageNets ($project, t) {
  let averageNet = {
    project: 0,
    sow: 0,
    'Ford AP': 0,
    Lincoln: 0,
    FCO: 0
  }

  averageNet.project = NP.divide($project.net, $project.FTE).simpleFixed(0)

  let $sows = await models.sow.findAll({
    transaction: t,
    where: {
      year: $project.year,
      sowType: clientType.Sold,
      isExecution: N,
      flowStatus: POCollected
    }
  })
  let clientIds = [specialClients['Ford AP'], specialClients.Lincoln, specialClients.FCO]
  let sumNet = 0,
    sumFTE = 0

  for (let $sow of $sows) {
    let {fordRate} = await getExcRate($sow.currencyId, $project.currencyId, $project.year, t)
    let net = NP.divide($sow.net, fordRate).simpleFixed(0)

    sumNet = NP.plus(net, sumNet)
    sumFTE = NP.plus($sow.FTE, sumFTE)
    if (clientIds.includes($sow.clientId)) {
      averageNet[$sow.clientId] = NP.divide(net, $sow.FTE).simpleFixed(0)
    }
  }
  averageNet.sow = NP.divide(sumNet, sumFTE).simpleFixed(0)

  return averageNet
}
