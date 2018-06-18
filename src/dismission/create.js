const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  moment = require('moment'),
  {attrDismission, attrFlowLog, attrPositionLog} = require('../args'),
  {DismissionMachine} = require('./stateMachine'),
  {formType} = require('config').get('args'),
  {positionLogStatus, dismissionStatus, recruitStatus} = require('config').get('flowCfg'),
  {Closed, TransferredIn} = positionLogStatus,
  getFormId = require('../commonFn/getFormId')

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
          dateFormat: ['YYYY-MM-DD', 'applicationDate', 'leaveDate', 'stopPayDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args, user, t) {
  let $positionLog = await models.positionLog.findById(args.positionLogId, {
    transaction: t,
    attributes: attrPositionLog,
    include: [{
      model: models.staff
    }]
  })

  if (!$positionLog) throw new Error(`没有该数据${args.positionLogId}`)
  await checkCreateDismission($positionLog, $positionLog.staff.name, t)

  let dismission = {
    staffId: $positionLog.staff.id,
    staffName: $positionLog.staff.name,
    positionLogId: $positionLog.id,
    flowStatus: dismissionStatus.ToSubmit,
    outLogOldStatus: $positionLog.flowStatus
  }

  dismission.id = await getFormId(moment(), formType.dismission, t)

  let $dismission = await models.dismission.create(dismission, {transaction: t})

  let machine = await (new DismissionMachine($dismission, user, t)).init()

  await machine.create()

  $dismission = await models.dismission.findOne({
    transaction: t,
    where: {id: $dismission.id},
    attributes: attrDismission,
    include: [{
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })
  return $dismission
}

/**
 * 检查是否能够创建 dismission
 * 1. positionLog 的年份必须是今年
 * 2. positionLog 的状态必须是 Closed, TransferredIn
 * 3. staffName 不能存在于进行中的招聘单中
 * @param {object} $positionLog positionLog 的数据
 * @param {string} staffName staff 名字
 * @param {object} t transaction
 * @return {null}
 */
async function checkCreateDismission ($positionLog, staffName, t) {
  if ($positionLog.year !== moment().year()) throw new Error(`不能创建 ${$positionLog.year} 年份的离职单`)
  if (![Closed, TransferredIn].includes($positionLog.flowStatus)) throw new Error(`Position 当前状态为 ${$positionLog.flowStatus}，无法进行离职`)

  let count = await models.recruit.count({
    transaction: t,
    where: {
      staffName,
      flowStatus: {$notIn: [recruitStatus.Onboarded, recruitStatus.Abandoned]}
    }
  })

  if (count !== 0) throw new Error(`${staffName} 已经在招聘中`)
}
