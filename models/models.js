/* eslint-disable */

const
    Sequelize = require('sequelize')
  , cfg = require('../config/appconfig/cfg')
  , flowCfg = require('../config/appconfig/flowCfg')
  ;

module.exports = (sequelize)=>{

  const account = sequelize.define("account", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 唯一ID，域账户用户名
    name: {type: Sequelize.STRING , allowNull: false, }, // 姓名，
    password: {type: Sequelize.STRING , allowNull: false, }, // 密码，
    title: {type: Sequelize.STRING ,}, // 职位，
    mail: {type: Sequelize.STRING ,}, // 邮箱，
    telephoneNumber: {type: Sequelize.STRING ,}, // 分机号，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['title']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '用户'
  });

  const signature = sequelize.define("signature", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // 签名ID，
    filePath: {type: Sequelize.STRING , allowNull: false, }, // 签名保存地址，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['filePath']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '用户签名表'
  });

  const role = sequelize.define("role", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 角色ID，
    name: {type: Sequelize.STRING , allowNull: false, }, // 角色名，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '角色'
  });

  const accountRole = sequelize.define("accountRole", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 当前状态，默认1，是否被删除
  },{
    freezeTableName: true,
    indexes:[
      
    ],
    description: '用户角色关联表'
  });

  const permission = sequelize.define("permission", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 权限ID，操作方式+操作对象
    object: {type: Sequelize.STRING , allowNull: false, }, // 操作对象，
    operation: {type: Sequelize.STRING , allowNull: false, }, // 操作方式，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '权限表'
  });

  const grant = sequelize.define("grant", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '角色权限关联表'
  });

  const flowLog = sequelize.define("flowLog", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    type: {type: Sequelize.ENUM , values: Object.values(cfg.logType) , allowNull: false,  readOnly: true, }, // 数据类别，sow/recruit/transfer/dismission/extension
    handle: {type: Sequelize.ENUM , values: Object.values(flowCfg.allOperation) , allowNull: false, }, // 当前操作，
    nextHandleStatus: {type: Sequelize.ENUM , values: Object.values(cfg.applyStatus) , defaultValue: 'toHandle',  readOnly: true, }, // 下一次操作的完成状态，待操作、已操作，表明接下来的操作人员是否完成了下一个操作
    remark: {type: Sequelize.STRING ,}, // 备注，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['nextHandleStatus']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '流程 log'
  });

  const dataLog = sequelize.define("dataLog", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    dataLogType: {type: Sequelize.ENUM , values: Object.values(cfg.dataLogType) , allowNull: false, }, // 数据类别，inChargeAccount
    data: {type: Sequelize.STRING ,}, // 数据内容，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['dataLogType']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '记录历史字段'
  });

  const company = sequelize.define("company", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 公司简称，
    name: {type: Sequelize.STRING ,}, // 公司全称，
    contact: {type: Sequelize.STRING ,}, // 联系人，
    telephone: {type: Sequelize.STRING ,}, // 联系电话，
    address: {type: Sequelize.STRING ,}, // 地址，
    email: {type: Sequelize.STRING ,}, // ，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '公司'
  });

  const companyDetail = sequelize.define("companyDetail", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    year: {type: Sequelize.INTEGER , allowNull: false, }, // 年份，
    payorType: {type: Sequelize.ENUM , values: Object.values(cfg.payorType) , allowNull: false,  readOnly: true, }, // 付款人类别，company / individual(个人的)
    rate: {type: Sequelize.DECIMAL(8,4) , defaultValue: 0, }, // 缴费率，
    max: {type: Sequelize.INTEGER , defaultValue: 0, }, // 社保上限，分本位
    min: {type: Sequelize.INTEGER , defaultValue: 0, }, // 社保下限，分本位
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '公司详情'
  });

  const currency = sequelize.define("currency", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 货币代号，
    country: {type: Sequelize.STRING ,}, // 币种国家，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '货币'
  });

  const currencyDetail = sequelize.define("currencyDetail", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    constantRateToUSD: {type: Sequelize.DECIMAL(14,8) , defaultValue: 0,  allowNull: false, }, // 内部汇率（兑美元），
    fordRateToUSD: {type: Sequelize.DECIMAL(14,8) , defaultValue: 0,  allowNull: false, }, // 外部汇率（兑美元），
    constantRateToRMB: {type: Sequelize.DECIMAL(14,8) , defaultValue: 0,  allowNull: false,  readOnly: true, }, // 内部汇率（兑RMB），
    fordRateToRMB: {type: Sequelize.DECIMAL(14,8) , defaultValue: 0,  allowNull: false,  readOnly: true, }, // 外部汇率（兑RMB），
    year: {type: Sequelize.INTEGER , allowNull: false, }, // 年份，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '货币 - 汇率'
  });

  const client = sequelize.define("client", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 客户名称，
    brief: {type: Sequelize.STRING , allowNull: false,  unique: true, }, // 简称，
    contact: {type: Sequelize.STRING ,}, // 联系人，
    address: {type: Sequelize.STRING ,}, // 地址，
    telephone: {type: Sequelize.STRING ,}, // 联系电话，
    email: {type: Sequelize.STRING ,}, // ，
    type: {type: Sequelize.ENUM , values: Object.values(cfg.clientType) , allowNull: false, }, // 客户类别，Outer（ 外部客户）/  Inner（ 内部客户）
    incentiveRate: {type: Sequelize.DECIMAL(8,4) , defaultValue: 0,  allowNull: false, }, // 奖金折扣率，
    taxDiscountRate: {type: Sequelize.DECIMAL(8,4) , defaultValue: 0,  allowNull: false, }, // 税折扣率，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['brief']},
      {method: 'BTREE',fields: ['type']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '客户'
  });

  const team = sequelize.define("team", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ，
    name: {type: Sequelize.STRING , allowNull: false,  unique: true, }, // 名称，
    brief: {type: Sequelize.STRING , allowNull: false,  unique: true, }, // 简称，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['brief']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '小组'
  });

  const ClientTeam = sequelize.define("ClientTeam", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: 'Client-team 关联表'
  });

  const office = sequelize.define("office", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 办公室名称，
    contact: {type: Sequelize.STRING ,}, // 联系人，
    address: {type: Sequelize.STRING ,}, // 地址，
    telephone: {type: Sequelize.STRING ,}, // 联系电话，
    email: {type: Sequelize.STRING ,}, // ，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '办公室'
  });

  const officeDetail = sequelize.define("officeDetail", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ，
    year: {type: Sequelize.INTEGER , allowNull: false, }, // 年份，
    mulRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0,  allowNull: false, }, // multiplier rate，
    dictRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0,  allowNull: false, }, // direct compensation rate，
    incRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0,  allowNull: false, }, // staff increase rate，
    benRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0,  allowNull: false, }, // benefit factor rate，
    overRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0,  allowNull: false, }, // overhead ration rate，
    mkpRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0,  allowNull: false, }, // markup rate，
    taxRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0,  allowNull: false, }, // tax rate，
    invRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0,  allowNull: false, }, // incentive rate，
    divRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0,  allowNull: false, }, // incentive divisor rate，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['year']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '办公室的比率'
  });

  const fordFunction = sequelize.define("fordFunction", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 简称，
    group: {type: Sequelize.INTEGER , allowNull: false, }, // 组别，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，0 废弃状态
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '客户的部门'
  });

  const title = sequelize.define("title", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 全称，sow 和 staff 中，保存该 title，可以手动输入
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '唬人的 title'
  });

  const stdPos = sequelize.define("stdPos", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ，
    name: {type: Sequelize.STRING , allowNull: false, }, // 名称，
    location: {type: Sequelize.ENUM , values: Object.values(cfg.location) , allowNull: false, }, // 归属地，本地有13薪，外籍没有
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '标准职称'
  });

  const stdPosDetail = sequelize.define("stdPosDetail", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ，
    skillLevel: {type: Sequelize.ENUM , values: Object.values(cfg.skillLevelType) , allowNull: false, }, // 级别，high/middle/low
    year: {type: Sequelize.INTEGER , allowNull: false, }, // 年份，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '标准职称详情'
  });

  const stdPosPrice = sequelize.define("stdPosPrice", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ，
    amount: {type: Sequelize.INTEGER , allowNull: false, }, // 金额，分本位
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '标准职称金额'
  });

  const salaryType = sequelize.define("salaryType", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // id，
    staffType: {type: Sequelize.ENUM , values: Object.values(cfg.staffType) , defaultValue: 'Regular', }, // 员工分类，员工类别，Regular/Freelancer
    category: {type: Sequelize.ENUM , values: Object.values(cfg.salaryCategory) ,}, // 薪资分类，薪资分类，salary、cola、bonus…
    distributeType: {type: Sequelize.ENUM , values: Object.values(cfg.distributeType) ,}, // 分发方式，ByMonth / ByYear
    location: {type: Sequelize.ENUM , values: Object.values(cfg.location) ,}, // 归属地，
    index: {type: Sequelize.INTEGER , readOnly: true, }, // 排序，分本位
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['index']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '薪资类别'
  });

  const sow = sequelize.define("sow", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    name: {type: Sequelize.STRING , allowNull: false, }, // sow 的名称，
    year: {type: Sequelize.INTEGER , allowNull: false,  _description: '2018', }, // 财务年度，
    version: {type: Sequelize.STRING , _description: '000', }, // 版本号，每年的同一 code 的版本号不可重复，000是初始复制版本
    sowType: {type: Sequelize.ENUM , values: Object.values(cfg.clientType) , allowNull: false, }, // 类别，根据 client 的类别 得到，
    isExecution: {type: Sequelize.ENUM('Y','N') , defaultValue: 'N', }, // 是否是执行版本，
    positionNum: {type: Sequelize.INTEGER , defaultValue: 0,  allowNull: false,  readOnly: true, }, // 总的岗位数，
    FTE: {type: Sequelize.DECIMAL(10, 6)  , defaultValue: 0,  allowNull: false,  readOnly: true, }, // 总的 FTE 数，
    openPositionNum: {type: Sequelize.INTEGER , defaultValue: 0,  allowNull: false,  readOnly: true, }, // 没有员工的岗位数，
    net: {type: Sequelize.BIGINT , defaultValue: 0, }, // sow 总 net，保存默认币种
    gross: {type: Sequelize.BIGINT , defaultValue: 0, }, // ，保存默认币种
    incentive: {type: Sequelize.BIGINT , defaultValue: 0, }, // 实际奖金，
    grandTotal: {type: Sequelize.BIGINT , defaultValue: 0, }, // 全年总预算，保存默认币种
    media: {type: Sequelize.BIGINT , defaultValue: 0, }, // ，
    production: {type: Sequelize.BIGINT , defaultValue: 0, }, // CRM + traditional + digital，
    traditional: {type: Sequelize.BIGINT , defaultValue: 0, }, // 传统广告，
    digital: {type: Sequelize.BIGINT , defaultValue: 0, }, // 数字广告，
    CRM: {type: Sequelize.BIGINT , defaultValue: 0, }, // 客户关系，
    travel: {type: Sequelize.BIGINT , defaultValue: 0, }, // 差旅费，
    total: {type: Sequelize.BIGINT , defaultValue: 0, }, // media + production + travel，
    otherFee: {type: Sequelize.JSON ,}, // passThrough 的费用，
    level1: {type: Sequelize.DECIMAL(10, 6)  , defaultValue: 0, }, // 等级 1 的 FTE 数，
    level2: {type: Sequelize.DECIMAL(10, 6)  , defaultValue: 0, }, // 等级 2 的 FTE 数，
    level3: {type: Sequelize.DECIMAL(10, 6)  , defaultValue: 0, }, // 等级 3 的 FTE 数，
    level4: {type: Sequelize.DECIMAL(10, 6)  , defaultValue: 0, }, // 等级 4 的 FTE 数，
    level5: {type: Sequelize.DECIMAL(10, 6)  , defaultValue: 0, }, // 等级 5 的 FTE 数，
    flowStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.sowStatus) , allowNull: false,  readOnly: true, }, // 审批流程状态，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['version']},
      {method: 'BTREE',fields: ['sowType']},
      {method: 'BTREE',fields: ['flowStatus']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '工作全年规划'
  });

  const position = sequelize.define("position", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    name: {type: Sequelize.STRING , allowNull: false, }, // 岗位编号，每年不可重复
    year: {type: Sequelize.INTEGER , allowNull: false, }, // 年份，
    skillLevel: {type: Sequelize.ENUM , values: Object.values(cfg.skillLevelType) , allowNull: false, }, // stdpos 级别，
    HCCategory: {type: Sequelize.STRING ,}, // position 的一种展现状态，参看流程图
    location: {type: Sequelize.ENUM , values: Object.values(cfg.location) , allowNull: false, }, // 员工归属地(与员工无关)，本地有13薪，外籍没有
    seqNo: {type: Sequelize.STRING , allowNull: false,  readOnly: true, }, // 初始序列号，参看流程图
    validDate: {type: Sequelize.DATEONLY ,}, // 生效日，
    invalidDate: {type: Sequelize.DATEONLY ,}, // 失效日，
    FTE: {type: Sequelize.DECIMAL(8, 6)  , defaultValue: 0, }, // ，天数除以 365
    annualSalary: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // 全年工资，
    annualCola: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // 全年补贴，
    bonus: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // 全年奖金，
    directComp: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // 各种钱，参看流程图，分本位
    benefits: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // ，
    directLabor: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // ，
    overhead: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // ，
    markup: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // ，
    net: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // ，
    tax: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // ，
    gross: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // ，
    budgetIncentive: {type: Sequelize.BIGINT , defaultValue: 0,  allowNull: false, }, // 预计奖金，
    sowLevel: {type: Sequelize.ENUM , values: Object.values(cfg.sowLevelType) , allowNull: false, }, // sow 级别，根据 directComp 划分 level
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '规划职位，隶属于 SOW'
  });

  const sowPosition = sequelize.define("sowPosition", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    FTE: {type: Sequelize.DECIMAL(8, 6)  , defaultValue: 0,  allowNull: false, }, // ，
    net: {type: Sequelize.BIGINT , defaultValue: 0, }, // ，采用的是 position 的币种
    tax: {type: Sequelize.BIGINT , defaultValue: 0, }, // ，
    gross: {type: Sequelize.BIGINT , defaultValue: 0, }, // ，
    incentive: {type: Sequelize.BIGINT , defaultValue: 0, }, // 实际奖金，每个客户会给一个比率，用于百分比
    grandTotal: {type: Sequelize.BIGINT , defaultValue: 0, }, // 全年总预算，
    confirmFlag: {type: Sequelize.ENUM('Y','N') , defaultValue: 'N', }, // 是否已确认，对应的 sow 是否已经确认了
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，正常为1，如果 sow 为 disabled，则变更为 0。如果是 execution，则为 2
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '规划职位详情'
  });

  const sowLevel = sequelize.define("sowLevel", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    year: {type: Sequelize.INTEGER , allowNull: false,  unique: true,  _description: '2017', }, // 生成年份，应用年份 = 生成年份 + 1
    level1Max: {type: Sequelize.INTEGER , defaultValue: 0,  allowNull: false, }, // 等级 1 的最大金额，level1 等级最低，level5 等级最高，单位为 RMB
    level2Max: {type: Sequelize.INTEGER , defaultValue: 0,  allowNull: false, }, // 等级 2 的最大金额，
    level3Max: {type: Sequelize.INTEGER , defaultValue: 0,  allowNull: false, }, // 等级 3 的最大金额，
    level4Max: {type: Sequelize.INTEGER , defaultValue: 0,  allowNull: false, }, // 等级 4 的最大金额，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['year']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '每年 Level 等级'
  });

  const clientPo = sequelize.define("clientPo", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    name: {type: Sequelize.STRING , allowNull: false, }, // po 的名称，
    production: {type: Sequelize.BIGINT , defaultValue: 0, }, // CRM + traditional + digital，
    gross: {type: Sequelize.BIGINT ,}, // sow 的 grossFee，
    incentive: {type: Sequelize.BIGINT , defaultValue: 0, }, // 实际奖金，
    travel: {type: Sequelize.BIGINT , defaultValue: 0, }, // 差旅费，
    media: {type: Sequelize.BIGINT , defaultValue: 0, }, // ，
    total: {type: Sequelize.BIGINT , defaultValue: 0, }, // gross + incentive + travel + media + production，
    passThroughFee: {type: Sequelize.JSON ,}, // passThrough 的一级费用，
    filePath: {type: Sequelize.STRING , allowNull: false, }, // 文件路径，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '客户订单'
  });

  const positionNote = sequelize.define("positionNote", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    noteContent: {type: Sequelize.STRING , allowNull: false, }, // 变更备注，
    beforeFTE: {type: Sequelize.DECIMAL(8, 6)  , defaultValue: 0,  allowNull: false, }, // 变更前 FTE，
    afterFTE: {type: Sequelize.DECIMAL(8, 6)  , defaultValue: 0,  allowNull: false, }, // 变更后 FTE，
    otherInfo: {type: Sequelize.JSON ,}, // 其它信息，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: 'position 变更记录'
  });

  const staff = sequelize.define("staff", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ID，
    name: {type: Sequelize.STRING , allowNull: false,  unique: true, }, // ，
    gender: {type: Sequelize.ENUM , values: Object.values(cfg.gender) ,}, // 性别，
    location: {type: Sequelize.ENUM , values: Object.values(cfg.location) ,}, // 国内国外，
    skillLevel: {type: Sequelize.ENUM , values: Object.values(cfg.skillLevelType) ,}, // stdpos 级别，
    staffType: {type: Sequelize.ENUM , values: Object.values(cfg.staffType) , allowNull: false, }, // 员工类别，
    flowStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.staffStatus) , allowNull: false, }, // 员工状态，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['location']},
      {method: 'BTREE',fields: ['staffType']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '员工'
  });

  const staffHistory = sequelize.define("staffHistory", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ID，
    validFlag: {type: Sequelize.ENUM('Y','N') , defaultValue: 'Y',  readOnly: true, }, // 是否当前生效，
    staffType: {type: Sequelize.ENUM , values: Object.values(cfg.staffType) , allowNull: false,  readOnly: true, }, // 员工类别，cfg.staffType
    entryDate: {type: Sequelize.DATE , allowNull: false, }, // 入职日期，
    leaveDate: {type: Sequelize.DATE ,}, // 人员实际离职日期，
    stopPayDate: {type: Sequelize.DATE ,}, // 公司停止发薪日，
    increaseCycle: {type: Sequelize.INTEGER ,}, // 加薪周期，正式员工必填
    nextIncreaseMonth: {type: Sequelize.STRING , _description: '&#39;2017-07&#39;', }, // 下次加薪年月，正式员工必填
    noticePeriod: {type: Sequelize.DECIMAL(6,2) ,}, // 离职提前月，单位为月
    contractFile: {type: Sequelize.STRING ,}, // 合同文件地址，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '员工历史，保存员工入职离职转岗信息，等同于合同'
  });

  const estimateSalary = sequelize.define("estimateSalary", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ID，
    month: {type: Sequelize.STRING , allowNull: false,  _description: '&#39;2017-09&#39;', }, // 发薪年月，
    taxType: {type: Sequelize.ENUM , values: Object.values(cfg.taxType) ,}, // 税前/税后，
    accountType: {type: Sequelize.ENUM , values: Object.values(cfg.accountType) ,}, // Freelancer 收款账户类型，
    basicSalary: {type: Sequelize.INTEGER , defaultValue: 0, }, // 基准薪资，
    workdays: {type: Sequelize.INTEGER , defaultValue: 0, }, // 工作日，
    net: {type: Sequelize.INTEGER , defaultValue: 0, }, // 基准薪资 * 基准时长，
    gross: {type: Sequelize.INTEGER , defaultValue: 0, }, // net*(1+taxRate)，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: 'freelancer 的预计薪资'
  });

  const freelancerContract = sequelize.define("freelancerContract", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ID，
    entryDate: {type: Sequelize.DATE , allowNull: false, }, // 合同入职日期，
    leaveDate: {type: Sequelize.DATE , allowNull: false, }, // 合同离职日期，
    amount: {type: Sequelize.INTEGER , allowNull: false, }, // 总金额，
    contractFile: {type: Sequelize.STRING ,}, // 合同文件地址，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: 'freelancer 的每次招聘、延期的合约'
  });

  const increasePool = sequelize.define("increasePool", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ID，
    increaseMonth: {type: Sequelize.STRING , allowNull: false,  _description: '&#39;2017-07&#39;', }, // 加薪年月，
    amount: {type: Sequelize.INTEGER , defaultValue: 0, }, // 加薪池金额，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '加薪池金额'
  });

  const increaseLog = sequelize.define("increaseLog", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ID，
    increased: {type: Sequelize.ENUM('Y','N') , defaultValue: 'N',  readOnly: true, }, // 是否已加薪，
    increaseMonth: {type: Sequelize.STRING , allowNull: false,  _description: '&#39;2017-07&#39;', }, // 加薪年月，
    increaseRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0, }, // 加薪率，
    monthlySalary: {type: Sequelize.INTEGER , defaultValue: 0, }, // 加薪前月薪，
    salaryIncrease: {type: Sequelize.INTEGER , defaultValue: 0, }, // 加薪金额，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '加薪 log'
  });

  const positionLog = sequelize.define("positionLog", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    name: {type: Sequelize.STRING , allowNull: false, }, // 岗位编号，每年不可重复
    seqNo: {type: Sequelize.STRING , allowNull: false, }, // 序列号，参看流程图
    year: {type: Sequelize.INTEGER , allowNull: false, }, // 年份，
    wasStaffName: {type: Sequelize.STRING ,}, // 上一条 log 的员工名，创建新 log 时继承
    skillLevel: {type: Sequelize.ENUM , values: Object.values(cfg.skillLevelType) , allowNull: false, }, // stdpos 级别，
    location: {type: Sequelize.ENUM , values: Object.values(cfg.location) , allowNull: false, }, // 员工归属地，本地有13薪，外籍没有
    entryDate: {type: Sequelize.DATE ,}, // 入职日，
    leaveDate: {type: Sequelize.DATE ,}, // 离职日，
    sowLevel: {type: Sequelize.ENUM , values: Object.values(cfg.sowLevelType) , allowNull: false, }, // sow 级别，根据 directComp 划分 level
    flowStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.positionLogStatus) , allowNull: false, }, // 对应正式员工的状态，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '规划职位 log'
  });

  const salaryStructure = sequelize.define("salaryStructure", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ID，
    validDate: {type: Sequelize.STRING(7) , allowNull: false,  _description: '&#39;2017-09&#39;', }, // 薪资结构生效年月，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['validDate']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '薪资结构'
  });

  const salaryRecord = sequelize.define("salaryRecord", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ID，
    date: {type: Sequelize.STRING , defaultValue: '2017-04', }, // 发薪对应年月，
    amount: {type: Sequelize.INTEGER ,}, // 金额，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '每月薪资记录'
  });

  const salaryDistribution = sequelize.define("salaryDistribution", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ID，
    type: {type: Sequelize.ENUM , values: Object.values(cfg.salaryDistributionType) , allowNull: false, }, // 数据类别，暂定，salaryStructure、positionLog、salaryRecord
    amount: {type: Sequelize.INTEGER , defaultValue: 0,  allowNull: false, }, // 金额，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '薪资类别金额分配'
  });

  const costDistribution = sequelize.define("costDistribution", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ID，
    costType: {type: Sequelize.ENUM , values: Object.values(cfg.costType) , allowNull: false, }, // 费用数据类别，正式员工的月薪、freelancer  的合同
    type: {type: Sequelize.ENUM , values: Object.values(cfg.costDistributionType) , allowNull: false, }, // 数据类别，
    percentage: {type: Sequelize.DECIMAL(6,2) , defaultValue: 0,  allowNull: false, }, // 占比，
    amount: {type: Sequelize.INTEGER , defaultValue: 0,  allowNull: false, }, // 金额，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '费用分配到项目'
  });

  const recruit = sequelize.define("recruit", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // ID，
    entryDate: {type: Sequelize.DATE ,}, // 入职日期，
    leaveDate: {type: Sequelize.DATE ,}, // 离职日期，
    staffName: {type: Sequelize.STRING ,}, // 候选人名称，
    recruitType: {type: Sequelize.ENUM , values: Object.values(cfg.recruitType) , allowNull: false,  readOnly: true, }, // 招聘类别，Regular/Freelancer
    basicInfo: {type: Sequelize.JSON ,}, // 保存申请单中 staff/job 的相关信息，
    inLogSalaryDistributions: {type: Sequelize.JSON ,}, // 入驻岗位的初始化时的薪资，
    staffSalaryDistributions: {type: Sequelize.JSON ,}, // 正式员工入职后的薪资，
    freelancerEstimateSalaries: {type: Sequelize.JSON ,}, // 临时员工的薪资预计，
    freelancerCostDistributions: {type: Sequelize.JSON ,}, // 临时员工的费用分配信息，freelancer 使用
    amount: {type: Sequelize.INTEGER , defaultValue: 0, }, // 总预算支出（freelancer），给 freelancer 用的
    flowStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.recruitStatus) , allowNull: false,  readOnly: true, }, // 审批流程状态，
    inLogOldStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.positionLogStatus) , readOnly: true, }, // 入驻岗位旧的状态，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['recruitType']},
      {method: 'BTREE',fields: ['flowStatus']},
      {method: 'BTREE',fields: ['inLogOldStatus']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '申请单'
  });

  const transfer = sequelize.define("transfer", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // ID，
    transferType: {type: Sequelize.ENUM , values: Object.values(cfg.transferType) , defaultValue: 'transferIn', }, // 转岗类别，对员工而言是转岗出去还是转岗进入
    transferDate: {type: Sequelize.DATE ,}, // 转岗日期，
    staffName: {type: Sequelize.STRING ,}, // 员工名称，
    basicInfo: {type: Sequelize.JSON ,}, // 保存申请单中 staff/job 的相关信息，company/location/office/currency/team/title/standardposition/skill level
    inLogSalaryDistributions: {type: Sequelize.JSON ,}, // 入驻岗位的初始化时的薪资，
    staffBeforeSalaryDistributions: {type: Sequelize.JSON ,}, // 员工转岗前的 salaryStructure，
    staffAfterSalaryDistributions: {type: Sequelize.JSON ,}, // 员工转岗后的 SalaryStructure，
    flowStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.transferStatus) , allowNull: false,  readOnly: true, }, // 审批流程状态，
    inLogOldStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.positionLogStatus) , allowNull: false, }, // 入驻岗位旧的状态，
    outLogOldStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.positionLogStatus) ,}, // 离职岗位旧的状态，
    salaryIncreaseFlag: {type: Sequelize.ENUM('y', 'n') , defaultValue: 'n', }, // 转岗加薪标记，转岗时如果薪资增加了，则标记为 y
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['flowStatus']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '转岗单'
  });

  const dismission = sequelize.define("dismission", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // ID，
    applicationDate: {type: Sequelize.DATE ,}, // 申请日期，
    leaveDate: {type: Sequelize.DATE ,}, // 离职日期，
    stopPayDate: {type: Sequelize.DATE ,}, // 公司停止发薪日，
    staffName: {type: Sequelize.STRING ,}, // 员工名称，
    flowStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.dismissionStatus) , allowNull: false,  readOnly: true, }, // 审批流程状态，
    outLogOldStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.positionLogStatus) , allowNull: false, }, // 离职岗位旧的状态，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['flowStatus']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '离职单'
  });

  const extension = sequelize.define("extension", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // ID，
    entryDate: {type: Sequelize.DATE ,}, // 入职日期，
    leaveDate: {type: Sequelize.DATE ,}, // 离职日期，
    staffName: {type: Sequelize.STRING ,}, // 员工名称，
    basicInfo: {type: Sequelize.JSON ,}, // 保存申请单中 staff/job 的相关信息，
    freelancerEstimateSalaries: {type: Sequelize.JSON ,}, // 临时员工的薪资预计，
    freelancerCostDistributions: {type: Sequelize.JSON ,}, // 费用分配信息，
    amount: {type: Sequelize.INTEGER ,}, // 总预算支出（freelancer），给 freelancer 用的
    flowStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.extensionStatus) , allowNull: false,  readOnly: true, }, // 审批流程状态，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['flowStatus']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '延期单'
  });

  const project = sequelize.define("project", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    name: {type: Sequelize.STRING ,}, // project 名，
    version: {type: Sequelize.STRING , allowNull: false,  _description: '&#39;001&#39;', }, // 版本号，
    year: {type: Sequelize.INTEGER , allowNull: false, }, // 年份，
    description: {type: Sequelize.STRING , allowNull: false, }, // 描述，
    inChargeAccount: {type: Sequelize.STRING ,}, // 负责人，保存到 dataLog 中，
    net: {type: Sequelize.BIGINT , defaultValue: 0, }, // 详情中的总 net，
    budgetAmount: {type: Sequelize.BIGINT , defaultValue: 0, }, // SUM(详情.net / office Multiplier)，
    tax: {type: Sequelize.BIGINT , defaultValue: 0, }, // 根据 office 的 taxRate 算出对应的 tax，
    gross: {type: Sequelize.BIGINT , defaultValue: 0, }, // 详情中的总 gross，
    FTE: {type: Sequelize.DECIMAL(10, 6)  , defaultValue: 0, }, // 总 FTE 数，
    poCode: {type: Sequelize.STRING ,}, // poCode 对应的编号，
    fee: {type: Sequelize.BIGINT , defaultValue: 0, }, // po中 fee 的金额，
    productionCost: {type: Sequelize.BIGINT , defaultValue: 0, }, // production 费用，
    poFilePath: {type: Sequelize.STRING ,}, // po 文件路径，
    totalAmount: {type: Sequelize.BIGINT , defaultValue: 0, }, // productionCost + gross，
    flowStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.projectStatus) , allowNull: false,  readOnly: true, }, // 审批流程状态，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['description']},
      {method: 'BTREE',fields: ['flowStatus']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: 'project'
  });

  const projectDetail = sequelize.define("projectDetail", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ID，
    skillLevel: {type: Sequelize.ENUM , values: Object.values(cfg.skillLevelType) , allowNull: false, }, // stdpos 级别，
    location: {type: Sequelize.ENUM , values: Object.values(cfg.location) , allowNull: false, }, // 员工归属地(与员工无关)，本地有13薪，外籍没有
    hours: {type: Sequelize.DECIMAL(6, 2)  , defaultValue: 0, }, // 工时数，
    FTE: {type: Sequelize.DECIMAL(8, 6)  , defaultValue: 0, }, // hours/1600，
    annualSalary: {type: Sequelize.BIGINT , defaultValue: 0, }, // 全年工资，Annual Salary = stdpos.Monthlysalary * 12
    annualNet: {type: Sequelize.BIGINT , defaultValue: 0, }, // 全年税前金额，
    net: {type: Sequelize.BIGINT , defaultValue: 0, }, // 税前实际金额，
    mulRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0, }, // multiplier rate，
    budgetAmount: {type: Sequelize.BIGINT , defaultValue: 0, }, // net / mulRate，
    taxRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0, }, // 税率，
    tax: {type: Sequelize.BIGINT , defaultValue: 0, }, // ，tax = net * office.taxRate
    gross: {type: Sequelize.BIGINT , defaultValue: 0, }, // 税后金额，gross = net + tax
    sowLevel: {type: Sequelize.ENUM , values: Object.values(cfg.sowLevelType) , allowNull: false, }, // sow 级别，根据 net 划分 level
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: 'projectDetail'
  });

  const production = sequelize.define("production", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // ID，
    year: {type: Sequelize.INTEGER , allowNull: false, }, // 年份，
    description: {type: Sequelize.STRING , allowNull: false, }, // 描述，
    inChargeAccount: {type: Sequelize.STRING ,}, // 负责人，保存到 dataLog 中，
    excRate: {type: Sequelize.DECIMAL(14,8) , defaultValue: 0, }, // 手动记录汇率，对 RMB 的汇率，
    peNet: {type: Sequelize.INTEGER , defaultValue: 0, }, // ，
    productionNet: {type: Sequelize.INTEGER , defaultValue: 0, }, // PE Net / ExcRate，是 RMB，
    mulRate: {type: Sequelize.DECIMAL(8,6) , defaultValue: 0, }, // multiplier rate，
    budgetAmount: {type: Sequelize.INTEGER , defaultValue: 0, }, // productionNet / mulRate，
    peFilePath: {type: Sequelize.STRING ,}, // po 文件路径，
    flowStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.productionStatus) , allowNull: false,  readOnly: true, }, // 审批流程状态，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['description']},
      {method: 'BTREE',fields: ['flowStatus']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: 'production'
  });

  const inhouseFreelancer = sequelize.define("inhouseFreelancer", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // ID，
    year: {type: Sequelize.INTEGER , allowNull: false, }, // 年份，
    description: {type: Sequelize.STRING ,}, // ，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，默认1，是否被删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['description']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: 'inhouseFreelancer'
  });

  const orgNode = sequelize.define("orgNode", {
    id: {type: Sequelize.INTEGER , primaryKey: true, autoIncrement: true ,}, // ID，
    tier: {type: Sequelize.INTEGER ,}, // 层级，
    title: {type: Sequelize.STRING ,}, // title 描述，
    nodeHistory: {type: Sequelize.JSON ,}, // 节点历史，保存节点历史记录，staffId、进入时间、离开时间、title、pId
    index: {type: Sequelize.INTEGER ,}, // 排序，
    status: {type: Sequelize.INTEGER ,}, // ，
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      
    ],
    description: '组织结构'
  });

  const message = sequelize.define("message", {
    id: {type: Sequelize.INTEGER , primaryKey: true, autoIncrement: true ,}, // ID，
    messageType: {type: Sequelize.ENUM , values: Object.values(cfg.messageType) ,}, // 消息类别，通知、待办，
    eventName: {type: Sequelize.STRING , allowNull: false, }, // 事件名，
    content: {type: Sequelize.STRING ,}, // 消息内容，
    data: {type: Sequelize.JSON ,}, // 数据存储，
    status: {type: Sequelize.INTEGER , defaultValue: 1, }, // 本消息是否需要被消费，0：消费完成，1：需要消费
    status: {type: Sequelize.INTEGER ,}, // ，
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      
    ],
    description: '通知消息'
  });
};
