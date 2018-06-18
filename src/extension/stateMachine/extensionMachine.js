const
  StateMachine = require('javascript-state-machine'),
  moment = require('moment'),
  {models} = require('../../../models/index'),
  config = require('config'),
  flowCfg = config.flowCfg,
  cfg = config.args,
  {
    ToSubmit,
    ToFDApprove, FDApproved, FDRefused,
    Extended, Abandoned
  } = flowCfg.extensionStatus,
  {
    create,
    submit, fdApprove, fdRefuse,
    extend, abandon
  } = flowCfg.extensionOperation,
  {
    hr, financeDirector
  } = config.init.initRoles,
  {Y, N, costType} = cfg,
  {handled} = cfg.applyStatus,
  {createEstimateSalary} = require('../../estimateSalary/create'),
  {createCostDistribution} = require('../../costDistribution/create')


const transitions = [
  {name: create, from: ['none', ToSubmit], to: ToSubmit},

  {name: submit, from: [ToSubmit, FDRefused], to: ToFDApprove},
  {name: fdApprove, from: ToFDApprove, to: FDApproved},
  {name: fdRefuse, from: ToFDApprove, to: FDRefused},

  {name: extend, from: FDApproved, to: Extended},
  {name: abandon, from: [ToSubmit, ToFDApprove, FDApproved, FDRefused], to: Abandoned},

  {name: 'goto', from: '*', to: s => s}
]

let nextHandler = {
  create: hr,
  submit: financeDirector,
  fdApprove: hr,
  fdRefuse: null,
  extend: null,
  abandon: null
}

const ExtensionMachine = StateMachine.factory({
  transitions,

  data: ($extension, user, t) => {
    if (!user) throw new Error('请登录')
    return {$extension, user, t}
  },

  methods: {
    init () {
      this.goto(this.$extension.flowStatus)
      return this
    },

    /**
     * 1. init 操作跳过本函数
     * 2. 变更 extension 的状态
     * 3. 将旧的 flowLog 变更为 handled
     * 4. 创建新的 flowLog，abandon、onboard 的 flowLog 的 nextHandleStatus 为已操作
     */

    async onBeforeTransition (action) {

      if (action.transition === 'goto') return
      await this.$extension.update({flowStatus: action.to}, {transaction: this.t})

      await models.flowLog.update({nextHandleStatus: handled}, {
        transaction: this.t,
        where: {commonId: this.$extension.id}
      })

      let flowLog = {
        handle: action.transition,
        handler: this.user.id,
        nextHandleRole: nextHandler[action.transition]
      }

      if ([extend, abandon].includes(action.transition)) flowLog.nextHandleStatus = handled
      await this.$extension.createFlowLog(flowLog, {transaction: this.t})
    },

    onSubmit (action) {
      let keys = ['entryDate', 'leaveDate', 'staffName', 'freelancerEstimateSalaries', 'freelancerCostDistributions', 'amount']

      for (let key of keys) {
        if (!this.$extension[key]) throw new Error(`申请单欠缺 ${key} 字段，无法提交`)
      }
      return this
    },

    /**
     * 确认延期
     * 1. 修改员工相关信息
     * 2. 修改 staffHistory 的 leaveDate
     * 3. 创建对应的 estimateSalary、freelancerConstract、costDistribution
     *
     * @param {object} staffInfo 员工信息
     *                    - entryDate 入职日期
     *                    - leaveDate 离职日期
     */

    async onExtend (action, staffInfo) {
      await this.$extension.update({
        entryDate: staffInfo.entryDate,
        leaveDate: staffInfo.leaveDate
      }, {transaction: this.t})

      let $staff = await models.staff.findById(this.$extension.staffId, {
        transaction: this.t,
        include: [{
          model: models.staffHistory,
          where: {validFlag: Y}
        }]
      })

      if (!$staff) throw new Error(`员工 ${this.$extension.staffId} 不存在`)
      await $staff.update(this.$extension.basicInfo, {transaction: this.t})
      await $staff.staffHistories[0].update({
        leaveDate: staffInfo.leaveDate
      }, {transaction: this.t})

      let freelancerContract = {
        ...staffInfo,
        staffId: $staff.id,
        amount: this.$extension.amount,
        currencyId: $staff.currencyId
      }
      let $freelancerContract = await models.freelancerContract.create(freelancerContract, {transaction: this.t})

      await createEstimateSalary(this.$extension.freelancerEstimateSalaries, $freelancerContract.id, $staff.id, this.t)
      await createCostDistribution(this.$extension.freelancerCostDistributions, costType.freelancerContract, $freelancerContract.id, this.t)
      return this
    },

    onAbandon (action) {
      return this
    },
  }
});

exports.ExtensionMachine = ExtensionMachine
exports.extensionTransitions = transitions
