// 普通审批
let
  toSubmit = 'toSubmit',
  disabled = 'disabled',

  toApproveByFD = 'toApproveByFD',
  refusedByFD = 'refusedByFD',

  toApproveByClient = 'toApproveByClient',
  refusedByClient = 'refusedByClient'

let
  create = 'create',
  submit = 'submit',

  fdRefuse = 'fdRefuse',
  fdApprove = 'fdApprove',

  clientRefuse = 'clientRefuse',
  clientApprove = 'clientApprove',

  abandon = 'abandon'

// 招聘
let
  Open = 'Open',
  Recruiting = 'Recruiting',
  Closed = 'Closed',
  ToBeOpen = 'ToBeOpen',
  TransferringIn = 'TransferringIn',
  TransferringOut = 'TransferringOut',
  TransferredIn = 'TransferredIn',
  TransferredOut = 'TransferredOut',
  Abandoned = 'Abandoned',
  Leaving = 'Leaving',
  Left = 'Left'


// sow 的审批状态
exports.sowStatus = {
  toSubmit, // 财务经理已创建，待提交
  toApproveByFD, // 已提交，待财务总监审批
  refusedByFD, // 财务总监拒绝，待提交
  toApproveByClient, // 财务总监批准，待客户审批（批准后可以再次拒绝）
  refusedByClient, // 客户拒绝，结束
  toCollectPO: 'toCollectPO', // 客户已批准，待上传 PO 文件（也可以再次点击客户拒绝）
  POCollected: 'POCollected', // 上传 PO 文件
  disabled, // 已失效（复制后，除了新版本，其它的版本都是已失效）
  special: 'special', // BackOffice/InHouse/LetGo 类别，创建后就是 special
}

exports.sowOperation = {
  create, // 创建
  submit, // 财务经理提交
  fdRefuse, // 财务总监拒绝
  fdApprove, // 财务总监批准
  clientRefuse, // 客户拒绝（财务总监操作）
  clientApprove, // 客户批准（财务总监操作）
  collectPO: 'collectPO', // 客户批准（财务总监操作）
}


// 员工状态没有招聘中
exports.staffStatus = {
  Onboarded: 'Onboarded', // 已入职
  Transferring: 'Transferring', // 转岗中
  Leaving: 'Leaving', // 离职中
  Left: 'Left', // 已离职

  Extending: 'Extending', // 延期中，freelancer 专用
}

exports.staffOperation = {
  entry: 'entry', // 入职
  transfer: 'transfer', // 转岗
  dismiss: 'dismiss', // 离职

  extend: 'extend', // 延期
}


exports.positionLogStatus = {
  Open, // 空着

  Recruiting, // 正在招聘正式员工
  Closed, // 正式员工已入职

  TransferringIn, // 正式员工转入中
  TransferredIn, // 正式员工已转入岗位

  TransferringOut, // 正式员工转出中
  TransferredOut, // 正式员工已转离岗位

  Leaving, // 离职中
  Left, // 已离职
}

// 招聘申请单状态
exports.recruitStatus = {
  JDCollected: 'JDCollected', // 开始招聘
  Interviewing: 'Interviewing', // 面试中
  CandidateIdentified: 'CandidateIdentified', // 候选人确定
  PackageNegotiating: 'PackageNegotiating', // 谈薪资
  Approving: 'Approving', // 已提交申请给财务总监
  Approved: 'Approved', // 财务总监已批准
  Offering: 'Offering', // 已发 offer
  OfferReceived: 'OfferReceived', // offer 已接收
  Onboarded: 'Onboarded', // 已到岗
  Abandoned: 'Abandoned', // 已废弃

  // 招聘 freelancer 的初始状态
  // CandidateIdentified // 待提交
  // Approving
  // Approved
  // Onboarded
  // Abandoned
}

// 招聘单操作
exports.recruitOperation = {
  collectJD: 'collectJD',
  interview: 'interview',
  identifyCandidate: 'identifyCandidate',
  negotiatePackage: 'negotiatePackage',
  submit: 'submit',
  approve: 'approve',
  refuse: 'refuse',
  offer: 'offer',
  receiveOffer: 'receiveOffer',
  onboard: 'onboard',
  abandon,
  backToInterviewing: 'backToInterviewing',

  // Freelancer 招聘单
  // identifyCandidate,
}

// 转岗单
exports.transferStatus = {
  ToSubmit: 'ToSubmit', // 已创建，待提交
  ToFDApprove: 'ToFDApprove', // 已提交，待审批
  FDApproved: 'FDApproved', // 财务总监已批准，待入职
  Transferred: 'Transferred', // 已转岗
  FDRefused: 'FDRefused', // 财务总监已拒绝，待提交
  Abandoned: 'Abandoned', // 已废弃
}

exports.transferOperation = {
  create,
  submit,
  fdApprove,
  fdRefuse,
  transfer: 'transfer', // 转岗
  abandon
}

// 离职申请单
exports.dismissionStatus = {
  ToSubmit: 'ToSubmit', // 已创建，待提交
  ToFDApprove: 'ToFDApprove', // 已提交，待审批
  FDApproved: 'FDApproved', // 财务总监已批准，待离职
  Dismissed: 'Dismissed', // 已离职
  FDRefused: 'FDRefused', // 财务总监已拒绝，待提交
  Abandoned: 'Abandoned', // 已废弃
}

exports.dismissionOperation = {
  create,
  submit,
  fdApprove,
  fdRefuse,
  dismiss: 'dismiss', // 离职
  abandon
}

// 延期申请单
exports.extensionStatus = {
  ToSubmit: 'ToSubmit', // 已创建，待提交
  ToFDApprove: 'ToFDApprove', // 已提交，待审批
  FDApproved: 'FDApproved', // 财务总监已批准，待离职
  Extended: 'Extended', // 已延期
  FDRefused: 'FDRefused', // 财务总监已拒绝，待提交
  Abandoned: 'Abandoned', // 已废弃
}

exports.extensionOperation = {
  create,
  submit,
  fdApprove,
  fdRefuse,
  extend: 'extend', // 延期
  abandon
}

// Project 状态
exports.projectStatus = {
  ToSubmit: 'ToSubmit', // 财务经理已创建，待提交
  ToApproveByFD: 'ToApproveByFD', // 已提交，待财务总监审批

  ToCollectPO: 'ToCollectPO', // 财务总监已批准，待录入 PO
  FDRefused: 'FDRefused', // 财务总监已拒绝，待提交

  POCollected: 'POCollected', // 已录入 PO
  Completed: 'Completed', // 已完成
  Abandoned: 'Abandoned', // 已废弃

  Disabled: 'Disabled', // 历史版本
}

exports.projectOperation = {
  create,
  submit,
  fdApprove,
  fdRefuse,
  collectPO: 'collectPO', // 录入 po
  complete: 'complete',
  abandon,

  disable: 'disable', // 版本变更为历史版本时
}

// production 的状态
exports.productionStatus = {
  Running: 'Running', // 执行中
  Completed: 'Completed', // 已完成
}

exports.allOperation = Object.assign(
  {}, exports.sowOperation, exports.staffOperation,
  exports.recruitOperation, exports.transferOperation, exports.dismissionOperation, exports.extensionOperation,
  exports.projectOperation
)
