const
  {models} = require('../../models/index'),
  cfg = require('config').get('args'),
  NP = require('number-precision'),
  {numberGenerate} = require('../../components/widgets/liujiaxi_widget')

// 公司
let companys = [
  {id: 'GTB SH', name: 'GTB Shanghai', contact: 'contact1', telephone: 123, address: '地址1', email: 'email1'},
  {id: 'GTB IN', name: 'GTB India', contact: 'contact1', telephone: 123, address: '地址1', email: 'email1'},
  {id: 'JWT AU', name: 'JWT Australia', contact: 'contact1', telephone: 123, address: '地址1', email: 'email1'},
  {id: 'JWT TH', name: 'JWT Thailand', contact: 'contact1', telephone: 123, address: '地址1', email: 'email1'},
  {id: 'JWT SH', name: 'JWT Shanghai', contact: 'contact1', telephone: 123, address: '地址1', email: 'email1'},
  {id: 'WM TH', name: 'Wunderman Thailand', contact: 'contact1', telephone: 123, address: '地址1', email: 'email1'},
  {id: 'MS SH', name: 'Mindshare Shanghai', contact: 'contact1', telephone: 123, address: '地址1', email: 'email1'},
  {id: 'WM SH', name: 'Wunderman Shanghai', contact: 'contact1', telephone: 123, address: '地址1', email: 'email1'},
]

// 社保上下限和社保率
let companyDetail = {payorType: 'Company', rate: 0.16, max: 1060000, min: 100000}

// 货币
let currencys = [
  {id: 'RMB', country: 'China'},
  {id: 'USD', country: 'USA'}
]

// 汇率
let currencyDetails = [
  {currencyId: 'RMB', year: '2016', constantRateToUSD: 7, fordRateToUSD: 8, constantRateToRMB: 1, fordRateToRMB: 1},
  {currencyId: 'USD', year: '2016', constantRateToUSD: 1, fordRateToUSD: 1, constantRateToRMB: NP.divide(1, 7), fordRateToRMB: NP.divide(1, 8)},
  {currencyId: 'RMB', year: '2017', constantRateToUSD: 7, fordRateToUSD: 8, constantRateToRMB: 1, fordRateToRMB: 1},
  {currencyId: 'USD', year: '2017', constantRateToUSD: 1, fordRateToUSD: 1, constantRateToRMB: NP.divide(1, 7), fordRateToRMB: NP.divide(1, 8)},
  {currencyId: 'RMB', year: '2018', constantRateToUSD: 7, fordRateToUSD: 8, constantRateToRMB: 1, fordRateToRMB: 1},
  {currencyId: 'USD', year: '2018', constantRateToUSD: 1, fordRateToUSD: 1, constantRateToRMB: NP.divide(1, 7), fordRateToRMB: NP.divide(1, 8)},
]

// 客户
let clients = [
  {id: 'Ford AP', brief: 'FAP', contact: '联系人1', type: cfg.clientType.Sold, incentiveRate: 0.7, taxDiscountRate: 0.7, telephone: 123, address: '地址1', email: 'email1'},
  {id: 'Lincoln', brief: 'LCN', contact: '联系人1', type: cfg.clientType.Sold, incentiveRate: 0.7, taxDiscountRate: 1, telephone: 123, address: '地址1', email: 'email1'},
  {id: 'FCO', brief: 'FCO', contact: '联系人1', type: cfg.clientType.Sold, incentiveRate: 0.7, taxDiscountRate: 1, telephone: 123, address: '地址1', email: 'email1'},
  {id: 'FCSD', brief: 'FCSD', contact: '联系人1', type: cfg.clientType.Sold, incentiveRate: 0.7, taxDiscountRate: 1, telephone: 123, address: '地址1', email: 'email1'},
  {id: 'Ford Credit', brief: 'FCDT', contact: '联系人1', type: cfg.clientType.Sold, incentiveRate: 0.7, taxDiscountRate: 1, telephone: 123, address: '地址1', email: 'email1'},
  {id: 'Ford Pass', brief: 'FPS', contact: '联系人1', type: cfg.clientType.Sold, incentiveRate: 0.7, taxDiscountRate: 1, telephone: 123, address: '地址1', email: 'email1'},
  {id: 'AEM', brief: 'AEM', contact: '联系人1', type: cfg.clientType.Sold, incentiveRate: 0.7, taxDiscountRate: 1, telephone: 123, address: '地址1', email: 'email1'},
  {id: 'GAM', brief: 'GAM', contact: '联系人1', type: cfg.clientType.Sold, incentiveRate: 0.7, taxDiscountRate: 1, telephone: 123, address: '地址1', email: 'email1'},
  {id: 'BackOffice', brief: 'BOF', contact: '联系人1', type: cfg.clientType.BackOffice, incentiveRate: 0.7, taxDiscountRate: 1, telephone: 123, address: '地址1', email: 'email1'},
  {id: 'InHouse', brief: 'IH', contact: '联系人1', type: cfg.clientType.InHouse, incentiveRate: 0.7, taxDiscountRate: 1, telephone: 123, address: '地址1', email: 'email1'},
  {id: 'LetGo', brief: 'LG', contact: '联系人1', type: cfg.clientType.LetGo, incentiveRate: 0.7, taxDiscountRate: 1, telephone: 123, address: '地址1', email: 'email1'},
]

// 部门
let teams = [
  {name: 'Management', brief: 'MGM', clientId: 'BackOffice'},
  {name: 'Finance', brief: 'FNC', clientId: 'BackOffice'},
  {name: 'HR', brief: 'HR', clientId: 'BackOffice'},
  {name: 'Admin', brief: 'Admin', clientId: 'BackOffice'},

  {name: 'Account_TraditionalAccount', brief: 'ATA', clientId: 'Ford AP'},
  {name: 'Account_DigitalEngagement', brief: 'ADE', clientId: 'Ford AP'},
  {id: 'team-02--9871-11e7-951e-9fc46ab347d2', name: 'Account_CRM', brief: 'ACRM', clientId: 'Ford AP'},
  {name: 'Account_ECommerce', brief: 'AEC', clientId: 'Ford AP'},
  {name: 'Account_Fleet', brief: 'AF', clientId: 'Ford AP'},
  {id: 'team-01--9871-11e7-951e-9fc46ab347d2', name: 'Creative', brief: 'CTV', clientId: 'Ford AP'},
  {name: 'Planning', brief: 'PLN', clientId: 'Ford AP'},
  {name: 'Platform', brief: 'PTF', clientId: 'Ford AP'},
  {name: 'MSU', brief: 'MSU', clientId: 'Ford AP'},
  {name: 'Media', brief: 'MDA', clientId: 'Ford AP'},
  {name: 'Data Hub_Thailand', brief: 'DHT', clientId: 'Ford AP'},
  {name: 'Data Hub_India', brief: 'DHI', clientId: 'Ford AP'},


  {name: 'Account_Traditional', brief: 'ATD', clientId: 'Lincoln'},
  {name: 'Account_Digital', brief: 'ADT', clientId: 'Lincoln'},
  {name: 'Account_CRM', brief: 'ACRM', clientId: 'Lincoln'},
  {name: 'Creative', brief: 'CTV', clientId: 'Lincoln'},
  {name: 'Planning', brief: 'PLN', clientId: 'Lincoln'},
  {name: 'MSU', brief: 'MSU', clientId: 'Lincoln'},
  {name: 'Media', brief: 'MDA', clientId: 'Lincoln'},
  {name: 'Media', brief: 'MDA', clientId: 'FCO'},
  {name: 'Platform', brief: 'PTF', clientId: 'Lincoln'},
  {name: 'Platform', brief: 'PTF', clientId: 'FCO'},
  {name: 'Data', brief: 'DT', clientId: 'Lincoln'},


  {name: 'Account', brief: 'ACT', clientId: 'FCO'},
  {name: 'Account', brief: 'ACT', clientId: 'FCSD'},
  {name: 'Account', brief: 'ACT', clientId: 'Ford Credit'},
  {name: 'Account', brief: 'ACT', clientId: 'GAM'},

  {name: 'Account', brief: 'ACT', clientId: 'Ford Pass'},
  {name: 'Planning', brief: 'PLN', clientId: 'Ford Pass'},

  {name: 'Platform', brief: 'PTF', clientId: 'AEM'},
]


// office
let offices = [
  {id: 'Shanghai Offsite', contact: '联系人', address: '地址', currencyId: 'USD', telephone: 123, email: 'email1'},
  {id: 'Shanghai Onsite', contact: '联系人', address: '地址', currencyId: 'RMB', telephone: 123, email: 'email1'},
  {id: 'China Offsite', contact: '联系人', address: '地址', currencyId: 'USD', telephone: 123, email: 'email1'},
  {id: 'China Onsite', contact: '联系人', address: '地址', currencyId: 'RMB', telephone: 123, email: 'email1'},
  {id: 'Australia Onsite', contact: '联系人', address: '地址', currencyId: 'USD', telephone: 123, email: 'email1'},
  {id: 'Australia Offsite', contact: '联系人', address: '地址', currencyId: 'USD', telephone: 123, email: 'email1'},
  {id: 'Thailand Onsite', contact: '联系人', address: '地址', currencyId: 'USD', telephone: 123, email: 'email1'},
  {id: 'Thailand Offsite', contact: '联系人', address: '地址', currencyId: 'USD', telephone: 123, email: 'email1'},
  {id: 'India Onsite', contact: '联系人', address: '地址', currencyId: 'USD', telephone: 123, email: 'email1'},
  {id: 'India Offsite', contact: '联系人', address: '地址', currencyId: 'USD', telephone: 123, email: 'email1'},
]

let officeDetail = [
  {officeId: 'Shanghai Offsite', year: '2016', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Shanghai Onsite', year: '2016', mulRate: 1.48005, dictRate: 1.86634305, incRate: 0.06, benRate: 0.261, overRate: 0.287, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.035, divRate: 32.86},
  {officeId: 'China Offsite', year: '2016', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'China Onsite', year: '2016', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Australia Onsite', year: '2016', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Australia Offsite', year: '2016', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Thailand Onsite', year: '2016', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Thailand Offsite', year: '2016', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'India Onsite', year: '2016', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'India Offsite', year: '2016', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},

  {officeId: 'Shanghai Offsite', year: '2017', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Shanghai Onsite', year: '2017', mulRate: 1.48005, dictRate: 1.86634305, incRate: 0.06, benRate: 0.261, overRate: 0.287, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.035, divRate: 32.86},
  {officeId: 'China Offsite', year: '2017', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'China Onsite', year: '2017', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Australia Onsite', year: '2017', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Australia Offsite', year: '2017', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Thailand Onsite', year: '2017', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Thailand Offsite', year: '2017', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'India Onsite', year: '2017', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'India Offsite', year: '2017', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},

  {officeId: 'Shanghai Offsite', year: '2018', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Shanghai Onsite', year: '2018', mulRate: 1.48005, dictRate: 1.86634305, incRate: 0.06, benRate: 0.261, overRate: 0.287, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.035, divRate: 32.86},
  {officeId: 'China Offsite', year: '2018', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'China Onsite', year: '2018', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Australia Onsite', year: '2018', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Australia Offsite', year: '2018', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Thailand Onsite', year: '2018', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'Thailand Offsite', year: '2018', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'India Onsite', year: '2018', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
  {officeId: 'India Offsite', year: '2018', mulRate: 2.11, dictRate: 2.55, incRate: 0.065, benRate: 0.209, overRate: 0.8348, mkpRate: 0.15, taxRate: 0.0677, invRate: 0.091, divRate: 12.64},
]

let fordFunctions = [
  {id: 'Account Mgt. Service'},
  {id: 'Business Systems & Marketing Ops'},
  {id: 'Client Accounting'},
  {id: 'Communication'},
  {id: 'Creative'},
  {id: 'Platform - Platform Management'},
  {id: 'Platform - Platform Measurement and Optimization'},
  {id: 'Platform - Engineering and Development'},
  {id: 'Media Buying'},
  {id: 'Media Planning & Research & Analytics'},
  {id: 'Production'},
  {id: 'Strategic Planning & Research'},
  {id: 'Support Team'},
  {id: 'Traffic'},
  {id: 'Independent Contractor / Freelance'},
]

let stdPosList = [
  // Management
  {id: 'stdpos-000-71-11e7-951e-9fc46ab347d2', name: 'President', officeId: 'Shanghai Onsite', teamName: 'Creative'},
  {id: 'stdpos-001-71-11e7-951e-9fc46ab347d2', name: 'Operation, Data and CRM Director', officeId: 'Shanghai Onsite', teamName: 'Planning'},
  {id: 'stdpos-002-71-11e7-951e-9fc46ab347d2', name: 'Business Lead', officeId: 'Shanghai Offsite', teamName: 'Creative'},
  {name: 'Chief Creative Officer', officeId: 'Shanghai Onsite', teamName: 'Account_CRM'},
  {name: 'Head of Strategy', officeId: 'Shanghai Offsite', teamName: 'Account_CRM'},
  {name: 'Head of MSU', officeId: 'Shanghai Onsite', teamName: 'Platform'},
  {name: 'Chief Finance Officier', officeId: 'Shanghai Onsite', teamName: 'Platform'},
  {name: 'Regional HR Director', officeId: 'Shanghai Onsite', teamName: 'Platform'},
  {name: 'Market Lead', officeId: 'Shanghai Offsite', teamName: 'Account'},

  // Account
  {name: 'Group Account Director', officeId: 'Shanghai Onsite', teamName: 'Account_TraditionalAccount'},
  {name: 'Senior Account Director', officeId: 'Shanghai Onsite', teamName: 'Account_TraditionalAccount'},
  {name: 'Account Director', officeId: 'Shanghai Offsite', teamName: 'Account_TraditionalAccount'},
  {name: 'Associate Account Director', officeId: 'Shanghai Onsite', teamName: 'Finance'},
  {name: 'Senior Account Manager', officeId: 'Shanghai Offsite', teamName: 'Finance'},
  {name: 'Account Manager', officeId: 'Shanghai Offsite', teamName: 'Account'},
  {name: 'Senior Account Executive', officeId: 'Shanghai Onsite', teamName: 'Management'},
  {name: 'Account Executive', officeId: 'Shanghai Onsite', teamName: 'Media'},
  //
  // Creative
  {name: 'Executive Creative Director'},
  {name: 'Senior Creative Director (Art)'},
  {name: 'Senior Creative Director (Copy)'},
  {name: 'Creative Director (Art)'},
  {name: 'Creative Director (Copy)'},
  {name: 'Associate Creative Director (Art)'},
  {name: 'Associate Creative Director (Copy)'},
  {name: 'Senior Art Director'},
  {name: 'Art Director'},
  {name: 'Senior Copywriter'},
  {name: 'Copywriter'},
  {name: 'Digital Design Director'},
  {name: 'Senior Digital Designer'},
  {name: 'Digital Designer'},
  {name: 'Associate Creative Service Director'},
  {name: 'Senior Creative Service Manager'},
  {name: 'Creative Service Manager'},

  // Planning
  {name: 'Planning Director'},
  {name: 'Associate Planning Director'},
  {name: 'Senior Planning Manager'},
  {name: 'Planning Manager'},
  {name: 'Senior Planner'},
  {name: 'Planner'},
  {name: 'Digital Strategy Director'},
  {name: 'Associate Digital Strategy Director'},
  {name: 'Senior Digital Strategy Manager'},
  {name: 'Digital Strategy Manager'},
  {name: 'Senior Digital Planner'},
  {name: 'Digital Planner'},

  // Platform
  {name: 'Marketing Technology Lead'},
  {name: 'Platform Director'},
  {name: 'Associate Platform Director'},
  {name: 'Senior Platform Manager'},
  {name: 'Platform Manager'},
  {name: 'Senior Platform Executive'},
  {name: 'Platform Executive'},
  {name: 'Senior Digital Producer'},
  {name: 'Digital Producer'},
  {name: 'Associate Digital Producer'},
  {name: 'Senior Project Manager'},
  {name: 'Project Manager'},
  {name: 'Senior Publishing Coordinator'},
  {name: 'Publishing Coordinator'},
  {name: 'Quality Assurance Manager'},
  {name: 'Compliance Manager'},

  // MSU
  {name: 'Group Analytics Director'},
  {name: 'Senior Analytics Director'},
  {name: 'Analytics Director'},
  {name: 'Associate Analytics Director'},
  {name: 'Senior Analytics Manager'},
  {name: 'Analytics Manager'},
  {name: 'Senior Analytics Associate'},
  {name: 'Analytics Associate'},

  // Media
  {name: 'Media Lead'},
  {name: 'Senior Media Director'},
  {name: 'Media Director'},
  {name: 'Associate Media Director'},
  {name: 'Senior Media Manager'},
  {name: 'Media Manager'},
  {name: 'Senior Media Associate'},
  {name: 'Media Associate'},

  // Data Hub
  {name: 'Marketing Service Director'},
  {name: 'Data Director'},
  {name: 'Operation Manager'},
  {name: 'Senior Data Analyst'},
  {name: 'Data Analyst'},
  {name: 'Senior Data Executive'},
  {name: 'Data Executive'},

  // BackOffice
  {name: 'HR Director'},
  {name: 'Associate HR Director'},
  {name: 'Senior HR Manager'},
  {name: 'HR Manager'},
  {name: 'HR Assistant'},
  {name: 'Finance Director'},
  {name: 'Finance Manager'},
  {name: 'Associate Finance Manager'},
  {name: 'Senior Finance Accountant'},
  {name: 'Finance Accountant'},
  {name: 'Associate Finance Accountant'},
  {name: 'Senior Admin Manager'},
  {name: 'Admin Assistant'},
  {name: 'Receptionist'},
]

let salaryTypes = [
  // Salary
  {id: 'Monthly Salary', category: cfg.salaryCategory.Salary, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Common, index: 1},
  {id: 'Salary Increase', category: cfg.salaryCategory.Salary, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Common, index: 2},
  {id: '13th Salary', category: cfg.salaryCategory.Salary, distributeType: cfg.distributeType.ByYear, location: cfg.location.Local, index: 3},

  // Social
  {id: 'Social Taxes', category: cfg.salaryCategory.Social, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Local, index: 4},

  // Cola
  {id: 'Meal', category: cfg.salaryCategory.Cola, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Local, index: 5},
  {id: 'COLA', category: cfg.salaryCategory.Cola, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 6},

  // Bonus
  {id: 'Spot Bonus', category: cfg.salaryCategory.Bonus, distributeType: cfg.distributeType.ByYear, location: cfg.location.Common, index: 7},
  {id: 'STIP', category: cfg.salaryCategory.Bonus, distributeType: cfg.distributeType.ByYear, location: cfg.location.Common, index: 8},
  {id: 'HiPo', category: cfg.salaryCategory.Bonus, distributeType: cfg.distributeType.ByYear, location: cfg.location.Common, index: 9},

  // Other
  {id: 'Medical Insurance Local', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Local, index: 10},
  {id: 'Medical Insurance Expat', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 11},
  {id: 'Housing', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 12},
  {id: 'Car', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 13},
  {id: 'Home Leave', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 14},
  {id: 'Education', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 15},
  {id: 'Hypo Housing', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 16},
  {id: 'China IIT', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 17},
  {id: 'Hypo Tax', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 18},
  {id: 'Pension', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 19},
  {id: 'FICA & Match Saving', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 20},
  {id: 'Property Mgt', category: cfg.salaryCategory.Other, distributeType: cfg.distributeType.ByMonth, location: cfg.location.Expat, index: 21},

  // freelancer 类别
  {id: 'Freelancer Daily Salary', staffType: cfg.staffType.Freelancer, index: 22},
  {id: 'Freelancer Monthly Salary', staffType: cfg.staffType.Freelancer, index: 23},
  {id: 'Freelancer One Time Salary', staffType: cfg.staffType.Freelancer, index: 24},
]

let titles = [
  {id: '客户经理'}, {id: '客户总监'}, {id: '客户总裁'}]


let initSystem = async t => {

  // 初始化 company
  await models.company.bulkCreate(companys, {transaction: t})
  let companyDetailArr = []

  companys.forEach(item => {
    companyDetailArr.push(Object.assign({}, companyDetail, {companyId: item.id, year: 2016}))
    companyDetailArr.push(Object.assign({}, companyDetail, {companyId: item.id, year: 2017}))
    companyDetailArr.push(Object.assign({}, companyDetail, {companyId: item.id, year: 2018}))
  })
  await models.companyDetail.bulkCreate(companyDetailArr, {transaction: t})

  // 初始化 currency
  await models.currency.bulkCreate(currencys, {transaction: t})
  await models.currencyDetail.bulkCreate(currencyDetails, {transaction: t})

  // 初始化 client
  await models.client.bulkCreate(clients, {transaction: t})

  // 初始化 team
  let teamArr = []

  teams.forEach(team => {
    let exit = false

    teamArr.forEach(exitTeam => {
      if (exitTeam.name === team.name) {
        exit = true
      }
    })

    if (!exit) teamArr.push(team)
  })
  let $teams = await models.team.bulkCreate(teamArr, {transaction: t})
  let teamList = {}

  $teams.forEach($team => {
    teamList[$team.name] = $team.id
  })

  // 初始化 ClientTeam
  let ClientTeams = []

  teams.forEach(item => {
    ClientTeams.push({
      teamId: teamList[item.name],
      clientId: item.clientId
    })
  })
  await models.ClientTeam.bulkCreate(ClientTeams, {transaction: t})

  // 初始化 office
  await models.office.bulkCreate(offices, {transaction: t})
  await models.officeDetail.bulkCreate(officeDetail, {transaction: t})


  // 初始化 fordFunction
  await models.fordFunction.bulkCreate(fordFunctions, {transaction: t})

  // 初始化 stdPos
  stdPosList.forEach(stdPos => {
    if (!stdPos.officeId) {
      let index = parseInt(numberGenerate(offices.length - 1, 0))

      stdPos.officeId = offices[index].id
    }
    if (!stdPos.teamName) stdPos.teamId = $teams[parseInt(numberGenerate($teams.length - 1, 0))].id
    else stdPos.teamId = teamList[stdPos.teamName]

    offices.forEach(office => {
      if (office.id === stdPos.officeId) {
        stdPos.currencyId = office.currencyId
        stdPos.location = office.id.endsWith('Onsite') ? cfg.location.Local : cfg.location.Expat
      }
    })
  })

  let $stdPoss = await models.stdPos.bulkCreate(stdPosList, {transaction: t})

  // 初始化 stdPosDetail
  let stdPosDetails = []
  let count = 1

  $stdPoss.forEach($stdPos => {
    Object.values(cfg.skillLevelType).forEach(skillLevel => {
      let temps = [{
        year: '2018',
        stdPosId: $stdPos.id,
        skillLevel
      }, {
        year: '2017',
        stdPosId: $stdPos.id,
        skillLevel
      }, {
        year: '2016',
        stdPosId: $stdPos.id,
        skillLevel
      }]

      let ids = ['stdpos-000-71-11e7-951e-9fc46ab347d2', 'stdpos-001-71-11e7-951e-9fc46ab347d2', 'stdpos-002-71-11e7-951e-9fc46ab347d2']

      if (ids.includes($stdPos.id) && skillLevel === cfg.skillLevelType.High) {
        stdPosDetails.push({
          ...temps[0],
          id: `stdPosDetial-2018-${count.prefix0(4)}-09fc46ab347d2`
        }, {
          ...temps[1],
          id: `stdPosDetial-2017-${count.prefix0(4)}-09fc46ab347d2`
        }, {
          ...temps[2],
          id: `stdPosDetial-2016-${count.prefix0(4)}-09fc46ab347d2`
        })
        count += 1
      }
      else stdPosDetails.push(...temps)
    })
  })
  let $stdPosDetails = await models.stdPosDetail.bulkCreate(stdPosDetails, {transaction: t})

  // 初始化 salaryType
  await models.salaryType.bulkCreate(salaryTypes, {transaction: t})

  // 初始化 stdPosPrice
  let stdPosPrice = []

  $stdPosDetails.forEach(detail => {
    salaryTypes.forEach(type => {
      if (type.category !== cfg.salaryCategory.Bonus) {
        stdPosPrice.push({
          stdPosDetailId: detail.id,
          salaryTypeId: type.id,
          amount: 1000000
        })
      }
    })
  })
  await models.stdPosPrice.bulkCreate(stdPosPrice, {transaction: t})

  // 初始化 title
  await models.title.bulkCreate(titles, {transaction: t})
}

exports.initSystem = initSystem
