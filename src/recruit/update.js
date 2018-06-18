const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {recruitStatus, staffStatus} = require('config').get('flowCfg'),
  {
    JDCollected, Interviewing, CandidateIdentified, PackageNegotiating, Onboarded, Abandoned
  } = recruitStatus,
  {staffType, recruitType} = require('config').get('args'),
  NP = require('number-precision'),
  {parseJSON} = require('../commonFn'),
  {JSONkeyRecruitArr} = require('../args')

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
    new Arg('basicInfo', false),
    new Arg('inLogSalaryDistributions', false),
    new Arg('staffSalaryDistributions', false),
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
  let $recruit = await models.recruit.findById(args.id, {transaction: t})

  if (!$recruit) throw new Error(`${args.id} 数据不存在`)
  parseJSON($recruit, JSONkeyRecruitArr)

  for (let key in args) {
    $recruit[key] = args[key]
  }
  await checkRecruitUpdate($recruit, t)

  if ($recruit.recruitType === recruitType.Freelancer) updateFreelancerCostDistributions($recruit)

  await $recruit.save({transaction: t})
}

/**
 * 检查能否编辑
 * 1. 只有 JDCollected, Interviewing, CandidateIdentified, PackageNegotiating 能够修改数据
 * 2. 如果当前没有该员工名，则允许创建
 * 3. 如果存在员工名，则根据招聘类型进行判断
 * 4. 该名字不能存在其他的活动中的招聘单中
 *
 * @param {object} $recruit 招聘单
 * @param {object} t transaction
 * @return {null}
 */
async function checkRecruitUpdate ($recruit, t) {
  if (![JDCollected, Interviewing, CandidateIdentified, PackageNegotiating].includes($recruit.flowStatus)) {
    throw new Error(`当前状态为${$recruit.flowStatus}，无法进行编辑`)
  }
  let $staff = await models.staff.findOne({
    transaction: t,
    where: {name: $recruit.staffName}
  })

  if (!$staff) return null

  if ($recruit.recruitType === recruitType.Regular) checkRecruitRegularStaffName($staff)
  if ($recruit.recruitType === recruitType.Freelancer) checkRecruitFreelancerStaffName($staff)

  let count = await models.recruit.count({
    transaction: t,
    where: {
      staffName: $recruit.staffName,
      flowStatus: {$notIn: [Onboarded, Abandoned]},
      id: {$ne: $recruit.id}
    }
  })

  if (count !== 0) throw new Error(`${$recruit.staffName} 已经在招聘中`)
  return null
}

/**
 * 检查正式员工招聘单的员工名
 *      1. 员工为正式员工，则状态只能为已离职员工
 *      2. 员工为 Freelancer，都可以
 *
 * @param {object} $staff 员工
 * @return {Promise.<null>}
 */
function checkRecruitRegularStaffName ($staff) {
  if (
    $staff.staffType === staffType.Regular &&
    $staff.flowStatus !== staffStatus.Left
  ) throw new Error(`${$staff.name} 当前状态为 ${$staff.flowStatus}，不能进行招聘`)
}


/**
 * 检查临时员工招聘单中的员工名
 *    1. 员工为正式员工，则状态可以是 Onboarded，Left
 *    2. 员工为临时员工，则状态只能是 Left
 *
 * @param {object} $staff 员工
 * @return {Promise.<void>}
 */
function checkRecruitFreelancerStaffName ($staff) {
  if (
    $staff.staffType === staffType.Regular &&
    ![staffStatus.Left, staffStatus.Onboarded].includes($staff.flowStatus)
  ) throw new Error(`${$staff.name} 当前状态为 ${$staff.flowStatus}，不能进行招聘`)

  if (
    $staff.staffType === staffType.Freelancer &&
    $staff.flowStatus !== staffStatus.Left
  ) throw new Error(`${$staff.name} 当前状态为 ${$staff.flowStatus}，不能进行招聘`)
}

/**
 * Freelancer 中修改 EstimateSalary 时，对应更新 Distribution，延期单中亦可用
 * 1. 检查是否存在 Distribution
 * 2. 根据比例，对应修改 Distribution 的金额 和 amount
 *
 * @param $recruitAfterUpdate 根据 args 修改后的 $recruit
 *
 */

function updateFreelancerCostDistributions ($recruitAfterUpdate) {
  if (!($recruitAfterUpdate.freelancerCostDistributions && $recruitAfterUpdate.freelancerEstimateSalaries)) return null


  $recruitAfterUpdate.amount = $recruitAfterUpdate.freelancerEstimateSalaries.reduce((sum, estimateSalary) => sum = NP.plus(sum, estimateSalary.gross), 0)
  $recruitAfterUpdate.freelancerCostDistributions.forEach(costDistribution => {
    costDistribution.amount = NP.times($recruitAfterUpdate.amount, costDistribution.percentage)
  })
  return null
}
exports.updateFreelancerCostDistributions = updateFreelancerCostDistributions
