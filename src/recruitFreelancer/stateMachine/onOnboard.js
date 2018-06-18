const
  {models} = require('../../../models/index'),
  config = require('config'),
  cfg = config.args,
  {Y, N, costType, staffType} = cfg,
  {staffStatus, positionLogStatus} = config.flowCfg,
  {createEstimateSalary} = require('../../estimateSalary/create'),
  {createCostDistribution} = require('../../costDistribution/create'),
  {copyLog} = require('../../positionLog'),
  createOrgNode = require('../../../app/service/orgNode/create')

/**
 * 确认入职
 * 1. 录入员工相关信息
 * 2. 根据招聘单中数据，创建员工
 * 3. 创建新的 staffHistory、estimateSalary、freelancerConstract、costDistribution
 *
 * @param {object} staffInfo 员工信息
 *                    - entryDate 入职日期
 *                    - leaveDate 离职日期
 *                    - contractFile 合同路径
 */

async function onOnboard (action, staffInfo) {
  let $staff = await createStaff(this.$recruit, staffInfo, this.t)
  let staffHistory = {
    staffId: $staff.id,
    validFlag: Y,
    staffType: staffType.Freelancer,

    ...staffInfo
  }

  await models.staffHistory.create(staffHistory, {transaction: this.t})

  let freelancerContract = {
    ...staffInfo,
    staffId: $staff.id,
    amount: this.$recruit.amount,
    currencyId: $staff.currencyId
  }
  let $freelancerContract = await models.freelancerContract.create(freelancerContract, {transaction: this.t})

  await createEstimateSalary(this.$recruit.freelancerEstimateSalaries, $freelancerContract.id, $staff.id, this.t)
  await createCostDistribution(this.$recruit.freelancerCostDistributions, costType.freelancerContract, $freelancerContract.id, this.t)
  await createOrgNode($staff, this.$recruit.basicInfo, this.t)
  await this.$recruit.update({
    entryDate: staffInfo.entryDate,
    leaveDate: staffInfo.leaveDate,
    freelancerContractId: $freelancerContract.id
  }, {transaction: this.t})

  return this
}

module.exports = onOnboard

/**
 * 创建 Freelancer
 * 1. 判断 staffName 对应的类别
 * 2. staffName 不存在，则创建新 Freelancer
 *      1. 创建员工
 * 3. staffName 存在，则检查其类别
 *      1. Freelancer - Left
 *          1. 变更员工的状态为 onboarded，更新员工信息
 *      2. Regular - Left
 *          1. 变更员工类别，更新员工信息
 *      3. Regular - Onboarded
 *          1. 变更员工类别，更新员工信息
 *          2. 更新对应的 staffHistory，删除 increaseLog
 *          3. 将对应的 positionLog 离职，然后复制一条 Log
 *
 * @param {object} $recruit
 *                    - staffName
 *                    - basicInfo
 * @param {object} staffInfo 员工信息
 *                    - entryDate 入职日期
 *                    - leaveDate 离职日期
 * @param {object} t transaction
 * @return {Promise.<void>}
 */

async function createStaff ($recruit, staffInfo, t) {
  let $staff = await models.staff.findOne({
    transaction: t,
    where: {
      name: $recruit.staffName
    },
    include: [{
      model: models.positionLog,
      attributes: ['id', 'name', 'seqNo', 'staffId', 'flowStatus'],
      separate: true,
      order: [['entryDate', 'DESC'], ['year', 'DESC']],
      limit: 1
    }]
  })

  if (!$staff) {
    let staff = {
      name: $recruit.staffName,
      staffType: staffType.Freelancer,
      flowStatus: staffStatus.Onboarded,

      ...$recruit.basicInfo
    }

    $staff = await models.staff.create(staff, {transaction: t})
  }
  else {
    if ($staff.staffType === staffType.Regular && $staff.flowStatus === staffStatus.Onboarded) {
      let $staffHistory = await models.staffHistory.findOne({
        transaction: t,
        where: {
          staffId: $staff.id,
          validFlag: Y
        }
      })

      await $staffHistory.update({
        validFlag: N,
        leaveDate: staffInfo.entryDate
      }, {transaction: t})
      await models.increaseLog.destroy({
        transaction: t,
        where: {
          staffId: $staff.id,
          increaseMonth: $staffHistory.nextIncreaseMonth
        }
      })

      await $staff.positionLogs[0].update({
        flowStatus: positionLogStatus.Left,
        leaveDate: staffInfo.entryDate
      }, {transaction: t})
      await copyLog($staff.positionLogs[0].id, t)
    }

    let updateStaff = {
      staffType: staffType.Freelancer,
      flowStatus: staffStatus.Onboarded,

      ...$recruit.basicInfo
    }

    await $staff.update(updateStaff, {transaction: t})

  }

  return $staff
}

