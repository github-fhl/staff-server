const
  StateMachine = require('javascript-state-machine'),
  config = require('config'),
  flowCfg = config.flowCfg,
  {
    ToSubmit, ToApproveByFD, ToCollectPO,
    FDRefused, POCollected, Completed,
    Abandoned, Disabled
  } = flowCfg.projectStatus,
  {
    create, submit, fdApprove, fdRefuse,
    collectPO, complete,
    abandon, disable
  } = flowCfg.projectOperation,
  onBeforeTransition = require('./onBeforeTransition'),
  onCollectPO = require('./onCollectPO')

const transitions = [
  {name: create, from: ['none', ToSubmit], to: ToSubmit},
  {name: submit, from: [ToSubmit, FDRefused], to: ToApproveByFD},
  {name: fdApprove, from: [ToApproveByFD], to: ToCollectPO},
  {name: fdRefuse, from: [ToApproveByFD], to: FDRefused},

  {name: collectPO, from: [ToCollectPO], to: POCollected},
  {name: complete, from: [POCollected], to: Completed},

  {name: abandon, from: [FDRefused, ToSubmit], to: Abandoned},
  {name: disable, from: [ToSubmit, ToApproveByFD, ToCollectPO, FDRefused], to: Disabled},

  {name: 'goto', from: '*', to: s => s}
]

const ProjectMachine = StateMachine.factory({
  transitions,

  data: ($project, user, t) => {
    if (!user) throw new Error('请登录')
    return {$project, user, t}
  },

  methods: {
    init () {
      this.goto(this.$project.flowStatus)
      return this
    },

    /** 初始操作 */
    onBeforeTransition,

    /** 录入 PO **/
    onCollectPO
  }
});

exports.ProjectMachine = ProjectMachine
exports.projectTransitions = transitions
