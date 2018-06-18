const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  config = require('config'),
  {
    ToSubmit, FDRefused
  } = config.flowCfg.transferStatus,
  {Onboarded} = config.flowCfg.staffStatus,
  {recruitStatus} = config.flowCfg,
  {Regular} = config.args.staffType

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)

  /**
   * basicInfo
   *    - location
   *    - companyId
   *    - currencyId
   *    - officeId
   *    - teamId
   *    - titleId
   *    - stdPosId
   *    - skillLevel
   *    - stdPosDetailId
   */

  let args = [
    new Arg('id', true),
    new Arg('transferDate', false),
    new Arg('staffName', false),
    new Arg('staffId', false),
    new Arg('outLogId', false),
    new Arg('outLogOldStatus', false),
    new Arg('basicInfo', false),
    new Arg('staffAfterSalaryDistributions', false),
    new Arg('remark', false)
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  let $transfer = await models.transfer.findById(args.id, {transaction: t})

  if (!$transfer) throw new Error(`${args.id} 数据不存在`)

  console.log('args: ', args)
  for (let key in args) {
    $transfer[key] = args[key]
  }
  await checkTransferUpdate($transfer, t)

  if (args.staffName) {
    let $staff = await models.staff.findOne({
      transaction: t,
      where: {
        name: $transfer.staffName
      },
      include: [{
        model: models.salaryStructure,
        separate: true,
        limit: 1,
        order: [['validDate', 'DESC']],
        include: [{
          model: models.salaryDistribution,
          separate: true,
          attributes: ['salaryTypeId', 'amount', 'commonId']
        }]
      }]
    })

    if (!$staff) throw new Error(`员工 ${$transfer.staffName} 数据不存在`)
    $transfer.staffId = $staff.id
    $transfer.staffBeforeSalaryDistributions = $staff.salaryStructures[0].salaryDistributions.map(salaryDistribution => {
      delete salaryDistribution.dataValues.commonId
      return salaryDistribution.dataValues
    })
  }

  await $transfer.save({transaction: t})
}

/**
 * 检查能否编辑
 * 1. 只有 ToSubmit, FDRefused 能够修改数据
 * 2. staff 只能是在岗的正式员工
 * 3. staffName 不能存在于进行中的招聘单中
 *
 * @param {object} $transfer 招聘单
 * @param {object} t transaction
 * @return {null}
 */
async function checkTransferUpdate ($transfer, t) {
  if (![ToSubmit, FDRefused].includes($transfer.flowStatus)) {
    throw new Error(`当前状态为${$transfer.flowStatus}，无法进行编辑`)
  }

  if (!$transfer.staffName) return
  let $staff = await models.staff.findOne({
    transaction: t,
    where: {name: $transfer.staffName}
  })

  if (!$transfer) throw new Error(`${$transfer.staffName} 不存在`)
  if ($staff.staffType !== Regular || $staff.flowStatus !== Onboarded) {
    throw new Error(`${$staff.name} 无法进行转岗，其状态为 ${$staff.flowStatus}，其类别为 ${$staff.staffType}`)
  }

  let count = await models.recruit.count({
    transaction: t,
    where: {
      staffName: $transfer.staffName,
      flowStatus: {$notIn: [recruitStatus.Onboarded, recruitStatus.Abandoned]}
    }
  })

  if (count !== 0) throw new Error(`${$transfer.staffName} 已经在招聘中`)
}
