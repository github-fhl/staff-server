const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  moment = require('moment'),
  {attrTransfer, attrPositionLog, JSONkeyTransferArr, attrFlowLog} = require('../args'),
  {TransferMachine} = require('./stateMachine'),
  {formType} = require('config').get('args'),
  {transferStatus} = require('config').get('flowCfg'),
  {parseJSON, getFormId, checkPositionLogRecruitOrTransferIn} = require('../commonFn')


exports.create = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('positionLogId', true)
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, req.user, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send({
          dateFormat: ['YYYY-MM-DD', 'transferDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args, user, t) {
  let $positionLog = await models.positionLog.findById(args.positionLogId, {
    transaction: t,
    attributes: attrPositionLog,
    include: [{
      model: models.salaryDistribution,
      attributes: ['salaryTypeId', 'amount']
    }]
  })
  let fields = [
    'location', 'companyId', 'currencyId', 'officeId',
    'teamId', 'titleId', 'stdPosId', 'skillLevel', 'stdPosDetailId'
  ]
  let basicInfo = {}

  fields.forEach(field => basicInfo[field] = $positionLog[field])

  let inLogSalaryDistributions = $positionLog.salaryDistributions

  if (!$positionLog) throw new Error(`没有该数据${args.positionLogId}`)
  await checkPositionLogRecruitOrTransferIn($positionLog.id, t)

  let transfer = {
    inLogId: $positionLog.id,
    flowStatus: transferStatus.ToSubmit,
    inLogOldStatus: $positionLog.flowStatus,
    basicInfo,
    inLogSalaryDistributions,
  }

  if ($positionLog.staffId) {
    transfer.transferType = 'transferOut'
  }

  transfer.id = await getFormId(moment(), formType.transfer, t)

  let $transfer = await models.transfer.create(transfer, {transaction: t})

  let machine = await (new TransferMachine($transfer, user, t)).init()

  await machine.create()

  $transfer = await models.transfer.findOne({
    transaction: t,
    where: {id: $transfer.id},
    attributes: attrTransfer,
    include: [{
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })
  parseJSON($transfer.dataValues, JSONkeyTransferArr)

  return $transfer
}
