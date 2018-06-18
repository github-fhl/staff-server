module.exports = {

  status: {
    normal: 1,
    deleted: 0
  },

  Y: 'Y',
  N: 'N',

  logType: {
    sow: 'sow',
    recruit: 'recruit',
    transfer: 'transfer',
    dismission: 'dismission',
    extension: 'extension',
    project: 'project',
  },

  applyStatus: {
    toHandle: 'toHandle',
    handled: 'handled',
  },

  // 员工归属地
  location: {
    Local: 'Local', // 本地
    Expat: 'Expat', // 外籍
    Common: 'Common', // 通用
  },

  // 社保 - 付款人类别
  payorType: {
    Individual: 'Individual', // 个人的
    Company: 'Company', // 公司的
  },

  // stdpos 的 skill level 级别
  skillLevelType: {
    High: 'High',
    Middle: 'Middle',
    Low: 'Low',
  },

  // SOW 的 level 级别
  sowLevelType: {
    level1: 'level1',
    level2: 'level2',
    level3: 'level3',
    level4: 'level4',
    level5: 'level5',
  },

  // 薪资分类
  salaryCategory: {
    Salary: 'Salary',
    Cola: 'Cola', // 补贴
    Bonus: 'Bonus',
    Social: 'Social', // 社保
    Other: 'Other',
  },

  // 标准薪资类别
  stdPosCategory: {
    Management: 'Management',
    Account: 'Account',
    Creative: 'Creative',
    Planning: 'Planning',
    Platform: 'Platform',
    MSU: 'MSU',
    Media: 'Media',
    'Data Hub': 'Data Hub',
    BackOffice: 'BackOffice',
  },

  // 薪资分发方式
  distributeType: {
    ByMonth: 'ByMonth',
    ByYear: 'ByYear',
    OncePayment: 'OncePayment',
  },

  // 客户类别
  clientType: {
    Sold: 'Sold', // 已卖给客户的
    BackOffice: 'BackOffice', // 后勤部门，BackOffice
    InHouse: 'InHouse', // 没卖完，但公司愿意养着的
    LetGo: 'LetGo', // 没卖完，公司不愿意养了
  },

  // 特殊客户
  specialClients: {
    'Ford AP': 'Ford AP',
    Lincoln: 'Lincoln',
    FCO: 'FCO',
  },

  // poCostType
  poCostType: {

    Traditional: 'Traditional', //
    Digital: 'Digital', //
    CRM: 'CRM', //
    Production: 'Production', //

    Media: 'Media', // 大概率不存在
    Travel: 'Travel', //
    GrossFee: 'GrossFee', // agency Fee
    Incentive: 'Incentive', //
  },

  // 币种
  RMB: 'RMB',
  USD: 'USD',

  // 薪资类型
  salaryType: {
    'Monthly Salary': 'Monthly Salary',
    '13th Salary': '13th Salary',
    COLA: 'COLA',
    Meal: 'Meal',
    'Salary Increase': 'Salary Increase',
    'Social Taxes': 'Social Taxes'
  },

  // 需要乘以税折扣率的的 office
  taxDiscountOffices: ['Shanghai Offsite', 'Shanghai Onsite', 'China Offsite', 'China Onsite'],

  // 新 sow 时，需要将 position 对应的 FTE 补全的公司
  coreCompany: 'GTB SH',

  // po 中金额上下调整的幅度(美元)
  adjustMoneyUSD: 100000,

  // 对 detail 的操作
  operation: {
    Create: 'Create',
    Update: 'Update',
    NoChange: 'NoChange',
    Delete: 'Delete'
  },

  // 历史数据类别
  dataLogType: {
    inChargeAccount: 'inChargeAccount'
  }
}

