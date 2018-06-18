const
  moment = require('moment'),
  {models} = require('../../../models/index'),
  config = require('config'),
  flowCfg = config.flowCfg,
  cfg = config.args,
  {Closed} = flowCfg.positionLogStatus,
  {Onboarded} = flowCfg.staffStatus,
  {Y, N, staffType} = cfg,
  {insertSalaryStructure} = require('../../staff'),
  {destroyEstimateSalary} = require('../../estimateSalary/destroy'),
  {createLogSalaryDistribution, getLogSowLevel} = require('../../positionLog'),
  createOrgNode = require('../../../app/service/orgNode/create')

/**
 * 确认入职
 * 1. 判断入职员工类别，然后创建或修改员工及其信息
 * 2. 根据 staff 的信息变更对应 positionLog 信息
 * 3. 根据 staff 的钱对应的创建 positionLog 的 salaryDistribution
 * 4.创建一条组织架构记录
 * @param {object} staffInfo 员工信息
 *                    - entryDate 入职日期
 *                    - increaseCycle 加薪周期
 *                    - nextIncreaseMonth 下次加薪年月
 *                    - noticePeriod 离职提前月
 *                    - contractFile 合同文件地址
 */

async function onOnboard (action, staffInfo) {
  await this.$recruit.update({entryDate: staffInfo.entryDate}, {transaction: this.t})

  let $staff = await createStaff(this.$recruit.staffName, this.$recruit.positionLogId, this.$recruit.basicInfo, staffInfo, this.$recruit.staffSalaryDistributions, this.t)

  await createLogSalaryDistribution(this.$recruit.positionLogId, this.$recruit.staffSalaryDistributions, this.t)

  let positionLogUpdateInfo = {
    staffId: $staff.id,
    entryDate: staffInfo.entryDate,
    flowStatus: Closed,
    ...this.$recruit.basicInfo
  }

  await models.positionLog.update(positionLogUpdateInfo, {
    transaction: this.t,
    where: {id: this.$recruit.positionLogId}
  })

  let positionLogSowLevel = await getLogSowLevel(this.$recruit.positionLogId, this.t)

  await createOrgNode($staff, this.$recruit.basicInfo, this.t)

  await models.positionLog.update({sowLevel: positionLogSowLevel}, {
    transaction: this.t,
    where: {id: this.$recruit.positionLogId}
  })
  return this
}

module.exports = onOnboard

/**
 * 根据 staff 类别，最后得到 staff
 * 1. 判断入职员工类别
 * 2. 如果 staffName 在数据库中不存在，则代表创建新员工
 *    1. 根据招聘单中数据，创建员工、staffHistory、salaryStructure、increaseLog
 * 3. 如果对应 staff 存在，且为已离职的正式员工、Freelancer
 *    1. 根据招聘单中数据，修改员工信息
 * 4. 如果对应 staff 为 Freelancer，且为在职
 *    1. 根据招聘单中数据，修改员工信息
 *    2. 修改原先的 staffHistory 的 leaveDate
 *    3. 删除入职月份之后的预计薪资
 * 5. 创建新的 staffHistory、salaryStructure、increaseLog
 *
 * @param {object} staffInfo 员工信息
 *                    - entryDate 入职日期
 *                    - increaseCycle 加薪周期
 *                    - nextIncreaseMonth 下次加薪年月
 *                    - noticePeriod 离职提前月
 */

async function createStaff (staffName, positionLogId, basicInfo, staffInfo, staffSalaryDistributions, t) {
  let $staff = await models.staff.findOne({
    transaction: t,
    where: {name: staffName}
  })

  if (!$staff) {
    let staff = {
      name: staffName,
      staffType: staffType.Regular,
      flowStatus: flowCfg.staffStatus.Onboarded,

      ...basicInfo
    }

    $staff = await models.staff.create(staff, {transaction: t})
  }
  else {
    if ($staff.flowStatus === Onboarded && $staff.staffType === staffType.Freelancer) {
      await models.staffHistory.update({
        validFlag: N,
        leaveDate: staffInfo.entryDate
      }, {
        transaction: t,
        where: {staffId: $staff.id}
      })

      await destroyEstimateSalary($staff.id, staffInfo.entryDate, t)
    }

    let updateStaff = {
      staffType: staffType.Regular,
      flowStatus: flowCfg.staffStatus.Onboarded,

      ...basicInfo
    }

    await $staff.update(updateStaff, {transaction: t})
  }

  let staffHistory = {
    staffId: $staff.id,
    validFlag: Y,
    positionLogId,
    staffType: staffType.Regular,

    ...staffInfo
  }
  let increaseLog = {
    staffId: $staff.id,
    increaseMonth: staffInfo.nextIncreaseMonth,
  }
  let salaryStructure = {
    staffId: $staff.id,
    validDate: moment(staffInfo.entryDate).format('YYYY-MM')
  }

  await models.staffHistory.create(staffHistory, {transaction: t})
  await models.increaseLog.create(increaseLog, {transaction: t})
  await insertSalaryStructure(salaryStructure, staffSalaryDistributions, t)

  return $staff
}
