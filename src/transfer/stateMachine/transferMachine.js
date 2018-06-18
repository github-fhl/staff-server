const
  StateMachine = require('javascript-state-machine'),
  moment = require('moment'),
  {models} = require('../../../models/index'),
  config = require('config'),
  {transferStatus, transferOperation, positionLogStatus, staffStatus} = config.flowCfg,
  cfg = config.args,
  {
    ToSubmit, ToFDApprove, FDApproved, Transferred, FDRefused, Abandoned
  } = transferStatus,
  {
    create, submit, fdApprove, fdRefuse, transfer, abandon
  } = transferOperation,
  {TransferringOut, TransferredOut, TransferringIn, TransferredIn} = positionLogStatus,
  {
    hr, financeDirector
  } = config.init.initRoles,
  {handled} = cfg.applyStatus,
  {insertSalaryStructure} = require('../../staff'),
  {createLogSalaryDistribution, getLogSowLevel, copyLog} = require('../../positionLog'),
  removeOrgNode = require('../../../app/service/orgNode/remove'),
  createOrgNode = require('../../../app/service/orgNode/create');

const transitions = [
  {name: create, from: ['none', ToSubmit], to: ToSubmit},
  {name: submit, from: [ToSubmit, FDRefused], to: ToFDApprove},
  {name: fdApprove, from: ToFDApprove, to: FDApproved},
  {name: fdRefuse, from: ToFDApprove, to: FDRefused},
  {name: transfer, from: FDApproved, to: Transferred},
  {name: abandon, from: [ToSubmit, ToFDApprove, FDApproved, FDRefused], to: Abandoned},

  {name: 'goto', from: '*', to: s => s}
]

let nextHandler = {
  create: hr,
  submit: financeDirector,
  fdApprove: hr,
  fdRefuse: hr,
  transfer: null,
  abandon: null
}

const TransferMachine = StateMachine.factory({
  transitions,

  data: ($transfer, user, t) => {
    if (!user) throw new Error('请登录')
    return {$transfer, user, t}
  },

  methods: {
    init () {
      this.goto(this.$transfer.flowStatus)
      return this
    },

    /**
     * 1. init 操作跳过本函数
     * 2. 变更 transfer 的状态
     * 3. 将旧的 flowLog 变更为 handled
     * 4. 创建新的 flowLog (abandon、onboard 的 flowLog 的 nextHandleStatus 为已操作)
     */

    async onBeforeTransition (action) {

      if (action.transition === 'goto') return
      await this.$transfer.update({flowStatus: action.to}, {transaction: this.t})

      await models.flowLog.update({nextHandleStatus: handled}, {
        transaction: this.t,
        where: {commonId: this.$transfer.id}
      })

      let flowLog = {
        handle: action.transition,
        handler: this.user.id,
        nextHandleRole: nextHandler[action.transition]
      }

      if ([transfer, abandon].includes(action.transition)) flowLog.nextHandleStatus = handled
      await this.$transfer.createFlowLog(flowLog, {transaction: this.t})
    },

    /**
     * 创建转岗申请单
     * 1. 将 inLog => TransferringIn
     * 2. 将 outLog => TransferringOut
     * 2. 将 staff => Leaving
     */

    async onCreate (action) {
      await models.positionLog.update({flowStatus: TransferringIn}, {
        transaction: this.t,
        where: {id: this.$transfer.inLogId}
      })
      await models.positionLog.update({flowStatus: TransferringOut}, {
        transaction: this.t,
        where: {id: this.$transfer.outLogId}
      })
      await models.staff.update({flowStatus: staffStatus.Transferring}, {
        transaction: this.t,
        where: {id: this.$transfer.staffId}
      })
      return this
    },

    onSubmit (action) {
      ['staffName', 'staffId', 'outLogId', 'outLogOldStatus', 'inLogSalaryDistributions', 'staffBeforeSalaryDistributions', 'staffAfterSalaryDistributions'].forEach(key => {
        if (!this.$transfer[key]) throw new Error(`需要录入${key}`)
      })
      return this
    },

    /**
     * 确认转岗时
     * 1. 录入转岗时间
     * 2. outLog => TransferredOut、leaveDate，为对应的 position 创建一条新的 Log
     * 3. staff => Onboarded
     * 4. 创建 staff 的 salaryStructure
     * 5. inLog => TransferredIn，basicfInfo
     * 6. 创建 inLog 的 salaryDistribution，并计算 log level
     *
     * @param {object} action action
     * @param {string} transferDate 转岗日期
     * @param {string} contractFile 合同路径
     * @return {null}
     */
    async onTransfer (action, transferDate, contractFile) {

      let beforeSalary, afterSalary, salaryIncreaseFlag

      for (let staffBeforeSalaryDistribution of this.$transfer.staffBeforeSalaryDistributions) {
        if (staffBeforeSalaryDistribution.salaryTypeId === 'Monthly Salary') beforeSalary = staffBeforeSalaryDistribution.amount
      }
      for (let staffAfterSalaryDistribution of this.$transfer.staffAfterSalaryDistributions) {
        if (staffAfterSalaryDistribution.salaryTypeId === 'Monthly Salary') afterSalary = staffAfterSalaryDistribution.amount
      }

      if (afterSalary > beforeSalary) {
        salaryIncreaseFlag = 'y'
      } else {
        salaryIncreaseFlag = 'n'
      }

      await this.$transfer.update({transferDate, salaryIncreaseFlag}, {transaction: this.t})

      await models.positionLog.update({
        flowStatus: TransferredOut,
        leaveDate: transferDate
      }, {
        transaction: this.t,
        where: {id: this.$transfer.outLogId}
      })
      await copyLog(this.$transfer.outLogId, this.t)

      await models.staff.update({
        flowStatus: staffStatus.Onboarded,
        ...this.$transfer.basicInfo
      }, {
        transaction: this.t,
        where: {id: this.$transfer.staffId}
      })

      let salaryStructure = {
        staffId: this.$transfer.staffId,
        validDate: moment(transferDate).format('YYYY-MM')
      }

      await insertSalaryStructure(salaryStructure, this.$transfer.staffAfterSalaryDistributions, this.t)
      await createLogSalaryDistribution(this.$transfer.inLogId, this.$transfer.staffAfterSalaryDistributions, this.t)

      let inLogUpdateInfo = {
        staffId: this.$transfer.staffId,
        entryDate: transferDate,
        flowStatus: TransferredIn,
        ...this.$transfer.basicInfo
      }

      await models.positionLog.update(inLogUpdateInfo, {
        transaction: this.t,
        where: {id: this.$transfer.inLogId}
      })

      let inLogSowLevel = await getLogSowLevel(this.$transfer.inLogId, this.t)

      await removeOrgNode(this.$transfer.staffId, this.t);

      if (this.$transfer.basicInfo.leaderId && this.$transfer.basicInfo.leaderId === this.$transfer.staffId) {
        throw new Error('Staff与Leader不能是同一人');
      }

      await createOrgNode({
        titleId: this.$transfer.basicInfo.titleId,
        id: this.$transfer.staffId
      }, this.$transfer.basicInfo, this.t);

      let $staffHistories = await models.staffHistory.findAll({
        where: {staffId: this.$transfer.staffId},
        order: [['entryDate', 'DESC']],
        transaction: this.t
      })

      let staffHistoryInfo = {
        entryDate: transferDate,
        staffId: this.$transfer.staffId,
        contractFile,
        staffType: cfg.staffType.Freelancer,
        positionLogId: this.$transfer.inLogId,
        validFlag: $staffHistories[0].validFlag,
        increaseCycle: $staffHistories[0].increaseCycle,
        noticePeriod: $staffHistories[0].noticePeriod,
        nextIncreaseMonth: $staffHistories[0].nextIncreaseMonth
      }

      await models.staffHistory.create(staffHistoryInfo, {transaction: this.t});

      await models.positionLog.update({sowLevel: inLogSowLevel}, {
        transaction: this.t,
        where: {id: this.$transfer.inLogId}
      })

      return this
    },

    /**
     * 废弃转岗单
     * 1. 将 inLog、OutLog 状态恢复
     * 2. 将 staff 状态恢复
     */

    async onAbandon (action) {
      await models.positionLog.update({flowStatus: this.$transfer.inLogOldStatus}, {
        transaction: this.t,
        where: {id: this.$transfer.inLogId}
      })
      if (this.$transfer.outLogOldStatus) {
        await models.positionLog.update({flowStatus: this.$transfer.outLogOldStatus}, {
          transaction: this.t,
          where: {id: this.$transfer.outLogId}
        })
      }
      await models.staff.update({flowStatus: staffStatus.Onboarded}, {
        transaction: this.t,
        where: {id: this.$transfer.staffId}
      })
      return this
    },
  }
});

exports.TransferMachine = TransferMachine
exports.transferTransitions = transitions
