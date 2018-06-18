const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index')

exports.create = (req, res) => {
  let api = new ApiDialect(req, res)

  /**
   * @param list
   *          - month
   *          - salaryTypeId
   *          - taxType
   *          - accountType
   *          - basicSalary
   *          - net
   *          - gross
   */

  let args = [
    new Arg('staffId', true),
    new Arg('list')
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => createEstimateSalary(api.args.list, api.args.staffId, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 * 创建 EstimateSalary
 *
 * @param estimateSalaryList
 *          - month
 *          - salaryTypeId
 *          - taxType
 *          - accountType
 *          - basicSalary
 *          - net
 *          - gross
 * @param freelancerContractId
 * @param staffId
 * @param t
 * @return {Promise.<void>}
 */

async function createEstimateSalary (estimateSalaryList, freelancerContractId, staffId, t) {
  let toDeleteMonths = estimateSalaryList.map(item => item.month)

  await models.estimateSalary.destroy({
    transaction: t,
    where: {
      freelancerContractId,
      staffId,
      month: {$in: toDeleteMonths}
    }
  })

  let $staff = await models.staff.findById(staffId, {transaction: t})

  let estimateSalarys = estimateSalaryList.map(item => ({
    ...item,
    freelancerContractId,
    staffId,
    currencyId: $staff.currencyId
  }))

  await models.estimateSalary.bulkCreate(estimateSalarys, {transaction: t})
}
exports.createEstimateSalary = createEstimateSalary
