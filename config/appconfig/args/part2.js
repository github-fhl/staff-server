const
  {Open, Recruiting, Closed, TransferringIn, TransferredIn, TransferringOut, TransferredOut, Leaving, Left} = require('../flowCfg').positionLogStatus

let
  Regular = 'Regular', // 正式员工
  Freelancer = 'Freelancer' // 临时员工

exports.orgNodeLeaderType = [
  Regular, // 正式员工
  Freelancer, // 临时员工
]
// 招聘单类别
exports.recruitType = {
  Regular, // 正式员工
  Freelancer // 临时员工
}

// 员工性别
exports.gender = {
  Male: 'Male',
  Female: 'Female',
}

// 员工类别
exports.staffType = {
  Regular, // 正式员工
  Freelancer // 临时员工
}

// 费用分配目标类别
exports.costType = {
  salaryRecord: 'salaryRecord',
  freelancerContract: 'freelancerContract',
  salaryStructure: 'salaryStructure',
}

// 费用分配项目类别
exports.costDistributionType = {
  position: 'position',
  project: 'project',
  production: 'production',
  inhouseFreelancer: 'inhouseFreelancer'
}

// 员工历史信息类别
// exports.historyType = {
//   Recruit: 'Recruit',
//   Transfer: 'Transfer',
//   Dimission: 'Dimission',
//   Adjustment: 'Adjustment', // 调整级别
// }

// Freelancer 的收款账户类型
exports.accountType = {
  PersonalAccount: 'PersonalAccount',
  'CompanyAcct3%': 'CompanyAcct3%',
  'CompanyAcct6%': 'CompanyAcct6%',
  'CompanyAcct17%': 'CompanyAcct17%',
  OverseaAcct: 'OverseaAcct',
}

// Freelancer 的收款账户类型对应的税率
exports.accountTypeTax = {
  'CompanyAcct3%': 0.03,
  'CompanyAcct6%': 0.06,
  'CompanyAcct17%': 0.17,
  OverseaAcct: 0.1881,
}

// salaryDistribution 的所属类别
exports.salaryDistributionType = {
  salaryStructure: 'salaryStructure',
  positionLog: 'positionLog',
  salaryRecord: 'salaryRecord'
}

// 税前税后的类别
exports.taxType = {
  PreTax: 'PreTax',
  AfterTax: 'AfterTax'
}

// freelancer 的薪资类别
exports.freelancerSalaryType = {
  'Freelancer Daily Salary': 'Freelancer Daily Salary', // 日薪
  'Freelancer Monthly Salary': 'Freelancer Monthly Salary', // 月薪
  'Freelancer One Time Salary': 'Freelancer One Time Salary', // 一次性薪水
}

// HR positionLog 页面的查看类别
// 排序不能乱，这是查询时的排序
exports.positionLogViewType = {
  In: 'In',
  Out: 'Out',
  Closed: 'Closed'
}

exports.positionLogViewTypeValue = {
  In: [Recruiting, TransferringIn, Open],
  Out: [Leaving, TransferringOut, TransferredOut, Left],
  Closed: [Closed, TransferredIn]
}

// positionLog 页面中，对应能够招聘、转岗、离职的 log 状态
exports.positionLogStatusToForm = {
  recruit: [Open],
  transfer: [Open],
  dismission: [Closed, TransferredIn]
}

// 申请单类别
exports.formType = {
  recruit: 'recruit',
  recruitFreelancer: 'recruitFreelancer',
  transfer: 'transfer',
  dismission: 'dismission',
  extension: 'extension'
}

// position 的预算类别
exports.budgetType = {
  stdPos: 'stdPos',
  staff: 'staff',
  adjusted: 'adjusted',
}
