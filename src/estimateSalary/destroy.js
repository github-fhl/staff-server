const
  moment = require('moment'),
  {models, sequelize} = require('../../models/index'),
  NP = require('number-precision'),
  {attrFreelancerContract, attrEstimateSalary} = require('../args')

/**
 * 删除 Freelancer month 月份后的 estimateSalary
 * 1. 查出该员工所有终止日期在 leaveDate 对应月份 后的合同，不包含该月份
 * 2. 删除合同中大于 month 月份的 estimateSalary
 * 3. 重新计算合同的总金额 及 分配支出
 * 4. 修改合同的结束日期为 leaveDate，如果结束日期 小于开始日期，则结束日期等于 开始日期
 *
 * @param {string} freelancerId 员工 id
 * @param {string} leaveDate 离开的日期，删除该日期对应月份后的数据，不包括该月份
 * @param {object} t transaction
 * @return {Promise.<void>}
 */
async function destroyEstimateSalary (freelancerId, leaveDate, t) {
  let leaveMonth = moment(leaveDate).format('YYYY-MM')
  let $freelancerContracts = await models.freelancerContract.findAll({
    transaction: t,
    attributes: attrFreelancerContract,
    where: sequelize.and(
      sequelize.where(
        sequelize.fn('DATE_FORMAT', sequelize.col('leaveDate'), '%Y-%m'),
        {$gt: leaveMonth}
      ),
      {staffId: freelancerId}
    ),
    include: [{
      model: models.estimateSalary,
      attributes: attrEstimateSalary,
      where: {
        month: {$lte: leaveMonth}
      }
    }, {
      model: models.costDistribution
    }]
  })

  for (let $freelancerContract of $freelancerContracts) {
    await models.estimateSalary.destroy({
      transaction: t,
      where: {
        freelancerContractId: $freelancerContract.id,
        month: {$gt: leaveMonth}
      }
    })

    $freelancerContract.amount = $freelancerContract.estimateSalaries.reduce((sum, $estimateSalary) => sum = NP.plus(sum, $estimateSalary.gross), 0)
    $freelancerContract.leaveDate = moment($freelancerContract.entryDate).format('YYYY-MM-DD') < leaveDate ? leaveDate : $freelancerContract.entryDate
    await $freelancerContract.save({transaction: t})

    let beforeSum = 0

    for (let i = 0; i < $freelancerContract.costDistributions.length; i++) {
      let $costDistribution = $freelancerContract.costDistributions[i]
      let amount = NP.times($freelancerContract.amount, $costDistribution.percentage)

      if (i < $freelancerContract.costDistributions.length - 1) {
        beforeSum = NP.plus(beforeSum, amount)
      }
      else {
        amount = NP.minus($freelancerContract.amount, beforeSum)
      }

      await $costDistribution.update({amount}, {transaction: t})
    }
  }

  return $freelancerContracts
}
exports.destroyEstimateSalary = destroyEstimateSalary
