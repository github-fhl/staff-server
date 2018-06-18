const
  {ApiDialect} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrStaff, attrCostDistribution, attrEstimateSalary, attrRecruit, attrStaffHistory} = require('../args'),
  config = require('config'),
  {staffType, recruitType} = config.get('args'),
  {recruitStatus, extensionStatus} = config.get('flowCfg'),
  {JSONkeyRecruitArr} = require('../args'),
  parseJSON = require('../commonFn/parseJSON'),
  {getBasicAmount} = require('../estimateSalary/calculateEstimateSalary')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'leaveDate', 'stopPayDate']
        })
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let includeCostDistribution = {
    model: models.costDistribution,
    attributes: attrCostDistribution,
    include: [{
      model: models.position,
      as: 'position',
      attributes: ['id', 'name']
    }, {
      model: models.project,
      as: 'project',
      attributes: ['id', 'name', 'description']
    }, {
      model: models.production,
      as: 'production',
      attributes: ['id', 'description']
    }, {
      model: models.inhouseFreelancer,
      as: 'inhouseFreelancer',
      attributes: ['id', 'description']
    }]
  }

  let $freelancers = await models.staff.findAll({
    attributes: attrStaff,
    where: {staffType: staffType.Freelancer},
    include: [{
      model: models.team,
      attributes: ['name']
    }, {
      model: models.stdPos,
      attributes: ['name'],
      as: 'stdPos'
    }, {
      model: models.extension,
      attributes: ['id', 'flowStatus'],
      required: false,
      where: {
        flowStatus: {$notIn: [extensionStatus.Extended, extensionStatus.Abandoned]}
      }
    }, {
      model: models.freelancerContract,
      separate: true,
      attributes: ['id', 'staffId', 'entryDate', 'leaveDate'],
      limit: 1,
      order: [['entryDate', 'DESC']],
      include: [includeCostDistribution]
    }, {
      model: models.estimateSalary,
      attributes: attrEstimateSalary,
      separate: true,
      limit: 1,
      order: [['month', 'DESC'], ['createdAt', 'DESC']]
    }, {
      model: models.staffHistory,
      attributes: attrStaffHistory,
      separate: true,
      limit: 1,
      order: [['entryDate', 'DESC']]
    }],
    order: [
      [models.team, 'name', 'ASC'],
      [{model: models.stdPos, as: 'stdPos'}, 'name', 'ASC'],
      ['name', 'ASC']
    ]
  })

  $freelancers.forEach($freelancer => {
    let basicAmount = getBasicAmount($freelancer.estimateSalaries[0].salaryTypeId, $freelancer.estimateSalaries[0].basicSalary, $freelancer.estimateSalaries[0].workdays)

    delete $freelancer.dataValues.estimateSalaries
    $freelancer.dataValues.basicAmount = basicAmount
    $freelancer.dataValues.salaryTypeId = $freelancer.estimateSalaries[0].salaryTypeId
  })

  let $recruits = await getRecruits()

  return {recruits: $recruits, freelancers: $freelancers}
}

/**
 * 获取所有 recruit
 * 1. 获取所有状态为 JDCollected、Approving、Approved 的 recruit
 * 2. 将其中的 JSON 进行 parse
 * 3. 计算最后一条 estimateSalary 对应的基准月薪，有可能不存在
 *
 * @return {Promise<void>}
 */

async function getRecruits () {
  let $recruits = await models.recruit.findAll({
    attributes: attrRecruit,
    where: {
      recruitType: recruitType.Freelancer,
      flowStatus: {$in: [recruitStatus.JDCollected, recruitStatus.Approving, recruitStatus.Approved]}
    },
    order: [['staffName', 'ASC']]
  })

  for (let $recruit of $recruits) {
    parseJSON($recruit.dataValues, JSONkeyRecruitArr)

    if ($recruit.freelancerEstimateSalaries) {
      let
        estimateSalary = {month: '0'}

      $recruit.dataValues.freelancerEstimateSalaries.forEach(freelancerEstimateSalary => {
        if (freelancerEstimateSalary.month > estimateSalary.month) estimateSalary = freelancerEstimateSalary
      })

      let basicAmount = getBasicAmount(estimateSalary.salaryTypeId, estimateSalary.basicSalary, estimateSalary.workdays)

      delete $recruit.dataValues.freelancerEstimateSalaries
      $recruit.dataValues.basicAmount = basicAmount
      $recruit.dataValues.salaryTypeId = estimateSalary.salaryTypeId
    }
  }

  return $recruits
}
