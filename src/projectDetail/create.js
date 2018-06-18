const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  NP = require('number-precision'),
  calculateProjectAmount = require('./calculateProjectAmount'),
  {checkOperationProjectDetail} = require('./checkOperationProjectDetail')

exports.create = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = Arg.factory(models.projectDetail)

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  await checkOperationProjectDetail(args.projectId, t)
  await createProjectDetail(args, t)
}


/**
 */


/**
 * 创建 projectDetail
 * 1. 获取 projectDetail 的 taxRate
 * 2. 计算 tax、gross，创建 detail 数据
 * 3. 找到对应的 project，换算汇率后更新 net/budgetAmount/tax/gross/totalAmount 字段
 *
 * @param {object} projectDetail detail 数据
 *                    - projectId
 *                    - companyId
 *                    - fordFunctionId
 *                    - officeId
 *                    - currencyId
 *                    - teamId
 *                    - location
 *                    - stdPosId
 *                    - skillLevel
 *                    - stdPosDetailId
 *                    - hours
 *                    - FTE
 *                    - annualSalary
 *                    - annualNet
 *                    - net
 *                    - mulRate
 *                    - budgetAmount
 */


async function createProjectDetail (projectDetail, t) {
  let $project = await models.project.findById(projectDetail.projectId, {
    transaction: t,
    include: [{
      model: models.projectDetail
    }]
  })

  let taxRate = await getDetailTaxRate($project.projectDetails, projectDetail.officeId, $project.year, t)

  projectDetail.tax = NP.times(projectDetail.net, taxRate).simpleFixed(0)
  projectDetail.taxRate = taxRate
  projectDetail.gross = NP.plus(projectDetail.net, projectDetail.tax)
  await models.projectDetail.create(projectDetail, {transaction: t})

  await calculateProjectAmount($project, projectDetail, t)
  await $project.save({transaction: t})
}
exports.createProjectDetail = createProjectDetail

/**
 * 获取 projectDetail 的 taxRate
 * 1. 检查 project details 是否存在相同 office 的 detail，如果存在则取该 detail 的 taxRate
 * 2. 如果不存在，则寻找 office 对应的 taxRate
 * @param {array} $projectDetails project 所有的 detail
 * @param officeId
 * @param {number} year project 的年份
 * @param t
 * @return {taxRate}
 */

async function getDetailTaxRate ($projectDetails, officeId, year, t) {
  let taxRate = 0

  $projectDetails.forEach($projectDetail => {
    if ($projectDetail.officeId === officeId) taxRate = $projectDetail.taxRate
  })

  if (taxRate === 0) {
    let $officeDetail = await models.officeDetail.findOne({
      transaction: t,
      where: {
        year,
        officeId
      }
    })

    if (!$officeDetail) throw new Error(`${officeId} 在 ${year} 没有数据`)
    taxRate = $officeDetail.taxRate
  }
  return taxRate
}
