const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  config = require('config'),
  {staffType, N} = config.get('args'),
  {staffStatus, extensionStatus} = config.get('flowCfg'),
  {destroyEstimateSalary} = require('../estimateSalary/destroy'),
  {Extended, Abandoned} = extensionStatus,
  removeOrgNode = require('../../app/service/orgNode/remove')

exports.freelancerDismission = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true),
    new Arg('leaveDate', true)
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, req.user, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 * 离职 Freelancer
 * 1. 员工状态变更为 left
 * 2. 更新 staffHistory 的 leaveDate
 * 3. 删除入职月份之后的预计薪资
 *
 */

async function run (args, user, t) {
  await checkFreelancerDismission(args.id, t)
  await models.staff.update({
    flowStatus: staffStatus.Left
  }, {
    transaction: t,
    where: {id: args.id}
  })
  await models.staffHistory.update({
    validFlag: N,
    leaveDate: args.leaveDate,
    stopPayDate: args.leaveDate
  }, {
    transaction: t,
    where: {id: args.id}
  })
  await removeOrgNode(args.id, t);
  await destroyEstimateSalary(args.id, args.leaveDate, t)
}

/**
 * 检查 Freelancer 离职
 * 1. 员工必须是 Freelancer
 * 2. 员工必须是在职
 * 3. 是否存在延期申请单，存在则不能离职
 */

async function checkFreelancerDismission (id, t) {
  let $freelancer = await models.staff.findById(id, {
    transaction: t,
    include: [{
      model: models.extension,
      required: false,
      where: {flowStatus: {$notIn: [Extended, Abandoned]}}
    }]
  })

  if (!$freelancer) throw new Error(`员工 ${id} 不存在`)
  if ($freelancer.staffType !== staffType.Freelancer) throw new Error(`${$freelancer.name} 不是 Freelancer`)
  if ($freelancer.flowStatus !== staffStatus.Onboarded) throw new Error(`${$freelancer.name} 状态不是 Onboarded，无法离职`)
  if ($freelancer.extensions.length !== 0) throw new Error('员工存在审批中的延期申请单')
}
