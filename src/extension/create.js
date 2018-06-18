const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  moment = require('moment'),
  {attrExtension, attrFlowLog, JSONkeyExtensionArr} = require('../args'),
  {ExtensionMachine} = require('./stateMachine'),
  {formType} = require('config').get('args'),
  {extensionStatus, staffStatus, recruitStatus} = require('config').get('flowCfg'),
  {parseJSON, getFormId} = require('../commonFn')

exports.create = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('staffId', true)
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
  await checkCreateExtension(args.staffId, t)

  let $staff = await models.staff.findById(args.staffId, {transaction: t})
  let extension = {
    staffId: args.staffId,
    flowStatus: extensionStatus.ToSubmit,
    staffName: $staff.name
  }

  extension.basicInfo = {
    gender: $staff.gender,
    location: $staff.location,
    companyId: $staff.companyId,
    currencyId: $staff.currencyId,
    officeId: $staff.officeId,
    teamId: $staff.teamId,
    titleId: $staff.titleId,
    stdPosId: $staff.stdPosId,
    skillLevel: $staff.skillLevel,
    stdPosDetailId: $staff.stdPosDetailId,
  }
  extension.id = await getFormId(moment(), formType.extension, t)

  let $extension = await models.extension.create(extension, {transaction: t})
  let machine = await (new ExtensionMachine($extension, user, t)).init()

  await machine.create()

  $extension = await models.extension.findOne({
    transaction: t,
    where: {id: $extension.id},
    attributes: attrExtension,
    include: [{
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })
  parseJSON($extension.dataValues, JSONkeyExtensionArr)
  return $extension
}

/**
 * 检查是否能够创建延期申请单
 * 1. 当前 freelancer 还没有离职
 * 2. 当前 freelancer 没有正在审批的延期申请单
 * 3. staffName 不能存在于进行中的招聘单中
 *
 * @param freelancerId
 * @return {Promise.<void>}
 */

async function checkCreateExtension (freelancerId, t) {
  let $freelancer = await models.staff.findById(freelancerId, {
    transaction: t,
    include: [{
      model: models.extension,
      required: false,
      where: {
        flowStatus: {$notIn: [extensionStatus.Extended, extensionStatus.Abandoned]}
      }
    }]
  })

  if (!$freelancer) throw new Error(`员工 ${freelancerId} 不存在`)
  if ($freelancer.flowStatus === staffStatus.Left) throw new Error(`员工 ${$freelancer.name} 已离职`)
  if ($freelancer.extensions.length !== 0) throw new Error(`员工 ${$freelancer.name} 正在进行延期操作`)

  let count = await models.recruit.count({
    transaction: t,
    where: {
      staffName: $freelancer.name,
      flowStatus: {$notIn: [recruitStatus.Onboarded, recruitStatus.Abandoned]}
    }
  })

  if (count !== 0) throw new Error(`${$freelancer.name} 已经在招聘中`)
}
