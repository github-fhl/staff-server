const
  StateMachine = require('javascript-state-machine'),
  config = require('config'),
  flowCfg = config.flowCfg,
  {
    JDCollected, Interviewing, CandidateIdentified, PackageNegotiating,
    Approving, Approved,
    Offering, OfferReceived,
    Onboarded, Abandoned
  } = flowCfg.recruitStatus,
  {
    collectJD, interview, identifyCandidate, negotiatePackage,
    submit, approve, refuse,
    offer, receiveOffer,
    onboard, abandon, backToInterviewing
  } = flowCfg.recruitOperation,
  onBeforeTransition = require('./onBeforeTransition'),
  onCollectJD = require('./onCollectJD'),
  onIdentifyCandidate = require('./onIdentifyCandidate'),
  onNegotiatePackage = require('./onNegotiatePackage'),
  onBackToInterviewing = require('./onBackToInterviewing'),
  onOnboard = require('./onOnboard'),
  onAbandon = require('./onAbandon')


const transitions = [
  {name: collectJD, from: ['none', JDCollected, Interviewing], to: JDCollected},
  {name: interview, from: [JDCollected, CandidateIdentified], to: Interviewing},
  {name: identifyCandidate, from: [Interviewing, PackageNegotiating], to: CandidateIdentified},
  {name: negotiatePackage, from: [CandidateIdentified], to: PackageNegotiating},

  {name: submit, from: PackageNegotiating, to: Approving},
  {name: approve, from: Approving, to: Approved},
  {name: refuse, from: Approving, to: PackageNegotiating},

  {name: offer, from: Approved, to: Offering},
  {name: receiveOffer, from: Offering, to: OfferReceived},

  {name: onboard, from: OfferReceived, to: Onboarded},
  {name: abandon, from: [JDCollected, Interviewing, CandidateIdentified, PackageNegotiating, Approving, Approved, Offering, OfferReceived], to: Abandoned},
  {name: backToInterviewing, from: [Approving, Approved, Offering, OfferReceived], to: Interviewing},

  {name: 'goto', from: '*', to: s => s}
]

const RecruitRegularMachine = StateMachine.factory({
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

    /** 初始操作 */
    onBeforeTransition,

    /** 创建 recruit */
    onCollectJD,

    /** 确认候选人 */
    onIdentifyCandidate,

    /** 确认薪资 */
    onNegotiatePackage,

    /** 确认入职 */
    onOnboard,

    /** 废弃 */
    onAbandon,

    /** 退回面试状态 */
    onBackToInterviewing,
  }
});

exports.RecruitRegularMachine = RecruitRegularMachine
exports.recruitRegularTransitions = transitions
