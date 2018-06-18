const
  StateMachine = require('javascript-state-machine'),
  moment = require('moment'),
  {models} = require('../../../models/index'),
  config = require('config'),
  {dismissionStatus, dismissionOperation, positionLogStatus, staffStatus} = config.flowCfg,
  cfg = config.args,
  {
    ToSubmit, ToFDApprove, FDApproved, Dismissed, FDRefused, Abandoned
  } = dismissionStatus,
  {
    create, submit, fdApprove, fdRefuse, dismiss, abandon
  } = dismissionOperation,
  {Leaving, Left} = positionLogStatus,
  {
    hr, financeDirector
  } = config.init.initRoles,
  {Y} = cfg,
  {handled} = cfg.applyStatus,
  {insertSalaryStructure} = require('../../staff'),
  {createLogSalaryDistribution, getLogSowLevel, copyLog} = require('../../positionLog'),
  removeOrgNode = require('../../../app/service/orgNode/remove')


const transitions = [
  {name: create, from: ['none', ToSubmit], to: ToSubmit},
  {name: submit, from: [ToSubmit, FDRefused], to: ToFDApprove},
  {name: fdApprove, from: ToFDApprove, to: FDApproved},
  {name: fdRefuse, from: ToFDApprove, to: FDRefused},
  {name: dismiss, from: FDApproved, to: Dismissed},
  {name: abandon, from: [ToSubmit, ToFDApprove, FDApproved, FDRefused], to: Abandoned},

  {name: 'goto', from: '*', to: s => s}
]

let nextHandler = {
  create: hr,
  submit: financeDirector,
  fdApprove: hr,
  fdRefuse: hr,
  dismission: null,
  abandon: null
}

const DismissionMachine = StateMachine.factory({
  transitions,

  data: ($dismission, user, t) => {
    if (!user) throw new Error('请登录')
    return {$dismission, user, t}
  },

  methods: {
    init () {
      this.goto(this.$dismission.flowStatus)
      return this
    },

    /**
     * 1. init 操作跳过本函数
     * 2. 变更 dismission 的状态
     * 3. 将旧的 flowLog 变更为 handled
     * 4. 创建新的 flowLog，abandon、onboard 的 flowLog 的 nextHandleStatus 为已操作
     */

    async onBeforeTransition (action) {

      if (action.transition === 'goto') return
      await this.$dismission.update({flowStatus: action.to}, {transaction: this.t})

      await models.flowLog.update({nextHandleStatus: handled}, {
        transaction: this.t,
        where: {commonId: this.$dismission.id}
      })

      let flowLog = {
        handle: action.transition,
        handler: this.user.id,
        nextHandleRole: nextHandler[action.transition]
      }

      if ([dismiss, abandon].includes(action.transition)) flowLog.nextHandleStatus = handled
      await this.$dismission.createFlowLog(flowLog, {transaction: this.t})
    },

    /**
     * 创建离职申请单
     * 1. 将 positionLog => Leaving
     * 2. 将 staff => Leaving
     */

    async onCreate (action) {
      await models.positionLog.update({flowStatus: Leaving}, {
        transaction: this.t,
        where: {id: this.$dismission.positionLogId}
      })
      await models.staff.update({flowStatus: staffStatus.Leaving}, {
        transaction: this.t,
        where: {id: this.$dismission.staffId}
      })
      return this
    },

    onSubmit (action) {
      ['applicationDate', 'leaveDate'].forEach(key => {
        if (!this.$dismission[key]) throw new Error(`需要录入${key}`)
      })
      return this
    },

    onFdApprove (action) {
      return this
    },

    onFdRefuse (action) {
      return this
    },

    /**
     * 确认离职
     * 1. 更新 离职单的 leaveDate
     * 2. 将 positionLog 的状态变更为 Left，离职日期 leaveDate
     * 3. 创建一条新的 positionLog
     * 4. staff 的状态变更为 Left
     * 5.移除组织架构记录
     * 6. 修改 staff 的 staffHistory、加薪 log
     */

    async onDismiss (action, leaveDate, stopPayDate) {
      await this.$dismission.update({leaveDate, stopPayDate}, {transaction: this.t})
      await models.positionLog.update({
        flowStatus: Left,
        leaveDate
      }, {
        transaction: this.t,
        where: {id: this.$dismission.positionLogId}
      })
      await copyLog(this.$dismission.positionLogId, this.t)

      await models.staff.update({flowStatus: staffStatus.Left}, {
        transaction: this.t,
        where: {id: this.$dismission.staffId}
      })

      let $staffHistory = await models.staffHistory.findOne({
        transaction: this.t,
        where: {
          staffId: this.$dismission.staffId,
          validFlag: Y
        }
      })

      await models.increaseLog.destroy({
        transaction: this.t,
        where: {
          staffId: this.$dismission.staffId,
          increaseMonth: $staffHistory.nextIncreaseMonth
        }
      })
      await $staffHistory.update({
        leaveDate,
        stopPayDate,
        nextIncreaseMonth: null
      }, {transaction: this.t})

      await removeOrgNode(this.$dismission.staffId, this.t);
    },

    /**
     * 废弃离职单
     * 1. 将 OutLog 状态恢复
     * 2. 将 staff 状态恢复
     */

    async onAbandon (action) {
      await models.positionLog.update({flowStatus: this.$dismission.outLogOldStatus}, {
        transaction: this.t,
        where: {id: this.$dismission.positionLogId}
      })
      await models.staff.update({flowStatus: staffStatus.Onboarded}, {
        transaction: this.t,
        where: {id: this.$dismission.staffId}
      })
      return this
    },
  }
});

exports.DismissionMachine = DismissionMachine
exports.dismissionTransitions = transitions
