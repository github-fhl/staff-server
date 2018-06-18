const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  moment = require('moment'),
  {attrRecruit, attrFlowLog, JSONkeyRecruitArr} = require('../args'),
  {RecruitRegularMachine} = require('./stateMachine'),
  {formType} = require('config').get('args'),
  {recruitStatus} = require('config').get('flowCfg'),
  {parseJSON, getFormId, checkPositionLogRecruitOrTransferIn} = require('../commonFn')

exports.create = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('recruitType', true),
    new Arg('positionLogId', true)
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, req.user, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'leaveDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args, user, t) {
  await checkPositionLogRecruitOrTransferIn(args.positionLogId, t)

  let $positionLog = await models.positionLog.findOne({
    transaction: t,
    where: {
      id: args.positionLogId
    },
    include: [{
      model: models.salaryDistribution,
      attributes: ['salaryTypeId', 'amount']
    }]
  })
  let basicInfo = {
    location: $positionLog.location,
    companyId: $positionLog.companyId,
    currencyId: $positionLog.currencyId,
    officeId: $positionLog.officeId,
    teamId: $positionLog.teamId,
    titleId: $positionLog.titleId,
    stdPosId: $positionLog.stdPosId,
    skillLevel: $positionLog.skillLevel,
    stdPosDetailId: $positionLog.stdPosDetailId,
  }
  let inLogSalaryDistributions = $positionLog.salaryDistributions
  let recruit = {
    positionLogId: args.positionLogId,
    recruitType: args.recruitType,
    basicInfo,
    inLogSalaryDistributions,
    flowStatus: recruitStatus.JDCollected,
    inLogOldStatus: $positionLog.flowStatus
  }

  recruit.id = await getFormId(moment(), formType.recruit, t)

  let $recruit = await models.recruit.create(recruit, {transaction: t})
  let machine = await (new RecruitRegularMachine($recruit, user, t)).init()

  await machine.collectJD()

  $recruit = await models.recruit.findOne({
    transaction: t,
    where: {id: $recruit.id},
    attributes: attrRecruit,
    include: [{
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })
  parseJSON($recruit.dataValues, JSONkeyRecruitArr)
  return $recruit
}
