const
  StateMachine = require('javascript-state-machine'),
  config = require('config'),
  flowCfg = config.flowCfg,
  {
    JDCollected,
    Approving, Approved,
    Onboarded, Abandoned
  } = flowCfg.recruitStatus,
  {
    collectJD,
    submit, approve, refuse,
    onboard, abandon
  } = flowCfg.recruitOperation,
  onBeforeTransition = require('./onBeforeTransition'),
  onOnboard = require('./onOnboard'),
  onSubmit = require('./onSubmit')


const transitions = [
  {name: collectJD, from: ['none', JDCollected], to: JDCollected},

  {name: submit, from: JDCollected, to: Approving},
  {name: approve, from: Approving, to: Approved},
  {name: refuse, from: Approving, to: JDCollected},

  {name: onboard, from: Approved, to: Onboarded},
  {name: abandon, from: [JDCollected, Approving, Approved], to: Abandoned},

  {name: 'goto', from: '*', to: s => s}
]


const RecruitFreelancerMachine = StateMachine.factory({
  transitions,

  data: ($recruit, user, t) => {
    if (!user) throw new Error('请登录')
    return {$recruit, user, t}
  },

  methods: {
    init () {
      this.goto(this.$recruit.flowStatus)
      return this
    },

    onBeforeTransition,

    /** 提交 */
    onSubmit,

    /** 入职 */
    onOnboard
  }
});

exports.RecruitFreelancerMachine = RecruitFreelancerMachine
exports.recruitFreelancerTransitions = transitions
