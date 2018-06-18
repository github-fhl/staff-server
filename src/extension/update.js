const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {
    ToSubmit, FDRefused
  } = require('config').flowCfg.extensionStatus,
  {Freelancer} = require('config').args.staffType,
  {parseJSON} = require('../commonFn'),
  {JSONkeyExtensionArr} = require('../args'),
  {updateFreelancerCostDistributions} = require('../recruit/update')

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)

  /**
   * basicInfo
   *    - gender
   *    - location
   *
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
    new Arg('entryDate', false),
    new Arg('leaveDate', false),
    new Arg('staffName', false),
    new Arg('staffId', false),
    new Arg('basicInfo', false),
    new Arg('freelancerEstimateSalaries', false),
    new Arg('freelancerCostDistributions', false),
    new Arg('amount', false),
    new Arg('remark', false),
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
  let $extension = await models.extension.findById(args.id, {transaction: t})

  if (!$extension) throw new Error(`${args.id} 数据不存在`)
  parseJSON($extension, JSONkeyExtensionArr)

  for (let key in args) {
    $extension[key] = args[key]
  }
  checkExtensionUpdate($extension)
  updateFreelancerCostDistributions($extension)

  await $extension.save({transaction: t})
}

/**
 * 检查能否编辑
 * 1. 只有 ToSubmit, FDRefused 能够修改数据
 * 2. 对应的 staff 必须是 freelancer
 *
 * @param {object} $extension  延期单
 * @param {object} t  transaction
 * @return {null}
 */
async function checkExtensionUpdate ($extension, t) {
  if (![ToSubmit, FDRefused].includes($extension.flowStatus)) {
    throw new Error(`当前状态为${$extension.flowStatus}，无法进行编辑`)
  }
  let $freelancer = await models.staff.findById($extension.staffId, {transaction: t})

  if (!$freelancer) throw new Error(`${$extension.staffId} 员工不存在`)
  if ($freelancer.staffType !== Freelancer) throw new Error(`${$freelancer.name} 不是 Freelancer`)
}
