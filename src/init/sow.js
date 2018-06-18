const
  cfg = require('config').get('args'),
  flowCfg = require('config').get('flowCfg'),
  {positionLogStatus} = flowCfg,
  {salaryDistributionType, Y, N, budgetType} = cfg,
  {models} = require('../../models/index'),
  {querySowLevel, queryPositionBudget, getFTE} = require('../position'),
  {getClientCostPure} = require('../sowPosition'),
  {createOrUpdateOrDeleteSowPosition} = require('../sowPosition')

let testStartSow = true


let sows2019 = [
  {
    id: '2019-Ford-AP-000-ada8d6-239091057e76',
    name: '2019 Ford AP', year: '2019', version: '000', clientId: 'Ford AP', sowType: cfg.clientType.Sold,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.disabled, status: 0,
    isExecution: cfg.N
  },
  {
    id: '2019-Ford-AP-001-ada8d6-239091057e76',
    name: '2019 Ford AP', year: '2019', version: '001', clientId: 'Ford AP', sowType: cfg.clientType.Sold,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.toSubmit,
    isExecution: cfg.N
  },
  {
    id: '2019-BackOffice-000-ada8d6-239091057',
    name: '2019 BackOffice', year: '2019', version: '000', clientId: 'BackOffice', sowType: cfg.clientType.BackOffice,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.special,
    isExecution: cfg.N
  },
  {
    id: '2019-InHouse-000-ada8d6-239045591057',
    name: '2019 InHouse', year: '2019', version: '000', clientId: 'InHouse', sowType: cfg.clientType.InHouse,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.special,
    isExecution: cfg.N
  },
  {
    id: '2019-LetGo-000-ada8d6-23904345591057',
    name: '2019 LetGo', year: '2019', version: '000', clientId: 'LetGo', sowType: cfg.clientType.LetGo,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.special,
    isExecution: cfg.N
  }
]

let sows2018 = [

  /**
   * 18 年的正常 sow
   */

  {
    id: '2018-Ford-AP-000-ada8d6-239091057e76',
    name: '2018 Ford AP', year: '2018', version: '000', clientId: 'Ford AP', sowType: cfg.clientType.Sold,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.disabled, status: 0,
    isExecution: cfg.N
  },
  {
    id: '2018-Ford-AP-001-ada8d6-239091057e76',
    name: '2018 Ford AP', year: '2018', version: '001', clientId: 'Ford AP', sowType: cfg.clientType.Sold,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.POCollected,
    isExecution: cfg.N
  },
  {
    id: '2018-FCO-001-qwe-ada8d6-239091057e76',
    name: '2018 FCO', year: '2018', version: '001', clientId: 'FCO', sowType: cfg.clientType.Sold,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: testStartSow ? flowCfg.sowStatus.POCollected : flowCfg.sowStatus.toSubmit,
    isExecution: cfg.N
  },
  {
    id: '2018-BackOffice-000-ada8d6-239091057',
    name: '2018 BackOffice', year: '2018', version: '000', clientId: 'BackOffice', sowType: cfg.clientType.BackOffice,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.special,
    isExecution: cfg.N
  },
  {
    id: '2018-InHouse-000-ada8d6-239045591057',
    name: '2018 InHouse', year: '2018', version: '000', clientId: 'InHouse', sowType: cfg.clientType.InHouse,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.special,
    isExecution: cfg.N
  },
  {
    id: '2018-LetGo-000-ada8d6-23904345591057',
    name: '2018 LetGo', year: '2018', version: '000', clientId: 'LetGo', sowType: cfg.clientType.LetGo,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.special,
    isExecution: cfg.N
  },


  /**
   * 18 年的 execution sow
   */
  {
    id: '2018execution-Ford-APd6-239091057e76',
    name: '2018 Ford AP', year: '2018', version: '000', clientId: 'Ford AP', sowType: cfg.clientType.Sold,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.POCollected,
    isExecution: cfg.Y
  },
  {
    id: '2018execution-FCO-werwer-23901057e76',
    name: '2018 FCO', year: '2018', version: '000', clientId: 'FCO', sowType: cfg.clientType.Sold,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: testStartSow ? flowCfg.sowStatus.POCollected : flowCfg.sowStatus.toSubmit,
    isExecution: cfg.Y
  },
  {
    id: '2018execution-BackOffice-23901057e76',
    name: '2018 BackOffice', year: '2018', version: '000', clientId: 'BackOffice', sowType: cfg.clientType.BackOffice,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.special,
    isExecution: cfg.Y
  },
  {
    id: '2018execution-InHouse-23901057eerd76',
    name: '2018 InHouse', year: '2018', version: '000', clientId: 'InHouse', sowType: cfg.clientType.InHouse,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.special,
    isExecution: cfg.Y
  },
  {
    id: '2018execution-LetGo-239010df57eerd76',
    name: '2018 LetGo', year: '2018', version: '000', clientId: 'LetGo', sowType: cfg.clientType.LetGo,
    currencyId: 'USD',
    media: 10000, production: 30000, traditional: 10000, digital: 10000, CRM: 10000, travel: 10000, total: 50000,
    flowStatus: flowCfg.sowStatus.special,
    isExecution: cfg.Y
  },
]


// sow
let sows = testStartSow ? [...sows2018] : [...sows2018, ...sows2019]

let attrArr = ['positionNum', 'FTE', 'openPositionNum', 'net', 'gross', 'grandTotal', 'level1', 'level2', 'level3', 'level4', 'level5']

sows.forEach(sow => {
  attrArr.forEach(attr => {
    sow[attr] = 0
  })
})

// clientPo
let clientPos = [{
  id: '2018-clientPo-001-ada8d6-23909105776',
  name: 'clientPos1',
  sowId: '2018-Ford-AP-001-ada8d6-239091057e76',
  executionSowId: '2018execution-Ford-APd6-239091057e76',
  currencyId: 'USD',
  production: 30000,
  incentive: 410,
  total: 30410,
  filePath: 'clientPo/路径-1513506678321.txt',
}]

// sowLevel
let sowLevels = [
  {
  year: '2016',
  level1Max: 2398900,
  level2Max: 3998200,
  level3Max: 7107900,
  level4Max: 11373400,
  currencyId: cfg.USD,
}, {
  year: '2017',
  level1Max: 2398900,
  level2Max: 3998200,
  level3Max: 7107900,
  level4Max: 11373400,
  currencyId: cfg.USD,
}, {
  year: '2018',
  level1Max: 2398900,
  level2Max: 3998200,
  level3Max: 7107900,
  level4Max: 11373400,
  currencyId: cfg.USD,
}]

let positions2019 = [
  {
    id: '2019-position-FAPCTV-0001-0ca216ebc1',
    name: 'FAPCTV 0001', year: '2019',

    expectStaffId: null, titleId: '客户总监', companyId: 'GTB SH', fordFunctionId: 'Client Accounting',
    stdPosName: 'President', skillLevel: cfg.skillLevelType.High,

    HCCategory: 'Jan 1 Closed', seqNo: 'A',
    validDate: '2019-01-01', invalidDate: '2019-12-31'
  }, {
    id: '2019-position-FAPPLN-0001-0ca216ebc1',
    name: 'FAPPLN 0001', year: '2019',

    expectStaffId: null, titleId: '客户总监', companyId: 'GTB SH', fordFunctionId: 'Client Accounting',
    stdPosName: 'Operation, Data and CRM Director', skillLevel: cfg.skillLevelType.High,

    HCCategory: 'Jan 1 Closed', seqNo: 'A',
    validDate: '2019-01-01', invalidDate: '2019-12-31'
  },
]

let positions2018 = [

  // 2018 的 position
  {
    id: '2018-position-FAPCTV-0001-0ca216ebc1',
    name: 'FAPCTV 0001', year: '2018',

    expectStaffId: null, titleId: '客户总监', companyId: 'GTB SH', fordFunctionId: 'Client Accounting',
    stdPosName: 'President', skillLevel: cfg.skillLevelType.High,

    HCCategory: '2018 New', seqNo: 'A',
    validDate: '2018-01-01', invalidDate: '2018-12-31',

    positionLogs: [{
      id: 'positionLog-2018-FAPCTV-0001-216ebc1',
      seqNo: 'A',
      flowStatus: positionLogStatus.Open,

      salaryDistributions: [{
        type: salaryDistributionType.positionLog,
        salaryTypeId: 'Monthly Salary', amount: 1000000
      }, {
        type: salaryDistributionType.positionLog,
        salaryTypeId: 'Meal', amount: 300000
      }]
    }]
  }, {
    id: '2018-position-FAPPLN-0001-0ca216ebc1',
    name: 'FAPPLN 0001', year: '2018',

    expectStaffId: null, titleId: '客户总监', companyId: 'GTB SH', fordFunctionId: 'Client Accounting',
    stdPosName: 'Operation, Data and CRM Director', skillLevel: cfg.skillLevelType.High,

    HCCategory: '2018 New', seqNo: 'A',
    validDate: '2018-01-01', invalidDate: '2018-12-31',

    positionLogs: [{
      id: 'positionLog-2018-FAPPLN-0001-216ebc1',
      seqNo: 'A',
      flowStatus: positionLogStatus.Open,

      salaryDistributions: [{
        type: salaryDistributionType.positionLog,
        salaryTypeId: 'Monthly Salary', amount: 1000000
      }, {
        type: salaryDistributionType.positionLog,
        salaryTypeId: 'Meal', amount: 300000
      }]
    }]
// }, {
//   id: '2018-position-FAPPLN-0002-0ca216ebc1',
//   name: 'FAPPLN 0002', year: '2018',
//
//   expectStaffId: null, titleId: '客户总监', companyId: 'GTB SH', fordFunctionId: 'Client Accounting',
//   stdPosName: 'Operation, Data and CRM Director', skillLevel: cfg.skillLevelType.High,
//
//   HCCategory: '2018 New', seqNo: 'A',
//   validDate: '2018-01-01', invalidDate: '2018-12-31',
//
//   positionLogs: [{
//     id: 'positionLog-2018-FAPPLN-0002-216ebc1',
//     seqNo: 'A',
//     flowStatus: positionLogStatus.Open,
//
//     salaryDistributions: [{
//       type: salaryDistributionType.positionLog,
//       salaryTypeId: 'Monthly Salary', amount: 1000000
//     }, {
//       type: salaryDistributionType.positionLog,
//       salaryTypeId: 'Meal', amount: 300000
//     }]
//   }]
  }
]

let positions = testStartSow ? [...positions2018] : [...positions2019, ...positions2018]

let sowPositions2019 = [

  // 2019 年的 sowPosition
  {sowName: '2019 Ford AP_000_N', positionId: '2019-position-FAPCTV-0001-0ca216ebc1', status: 0, FTE: 1},
  {sowName: '2019 Ford AP_001_N', positionId: '2019-position-FAPCTV-0001-0ca216ebc1', status: 1, FTE: 0.5},

  {sowName: '2019 Ford AP_000_N', positionId: '2019-position-FAPPLN-0001-0ca216ebc1', status: 0, FTE: 1},
  {sowName: '2019 Ford AP_001_N', positionId: '2019-position-FAPPLN-0001-0ca216ebc1', status: 1, FTE: 1},

  {sowName: '2019 BackOffice_000_N', positionId: '2019-position-FAPCTV-0001-0ca216ebc1', status: 1, FTE: 0.5},
]

let sowPositions2018 = [

  // 2018 年的 sowPosition
  {sowName: '2018 Ford AP_000_N', positionId: '2018-position-FAPCTV-0001-0ca216ebc1', status: 0, FTE: 1},
  {sowName: '2018 Ford AP_001_N', positionId: '2018-position-FAPCTV-0001-0ca216ebc1', status: 1, FTE: 0.5},

  {sowName: '2018 Ford AP_000_N', positionId: '2018-position-FAPPLN-0001-0ca216ebc1', status: 0, FTE: 1},
  {sowName: '2018 Ford AP_001_N', positionId: '2018-position-FAPPLN-0001-0ca216ebc1', status: 1, FTE: 0.7},

  {sowName: '2018 FCO_001_N', positionId: '2018-position-FAPPLN-0001-0ca216ebc1', status: 1, FTE: 0.3},

  {sowName: '2018 BackOffice_000_N', positionId: '2018-position-FAPCTV-0001-0ca216ebc1', status: 1, FTE: 0.5},

  // 2018 年的执行版本的 sowPosition
  {sowName: '2018 Ford AP_000_Y', positionId: '2018-position-FAPCTV-0001-0ca216ebc1', status: 2, FTE: 0.5, confirmFlag: Y},

  {sowName: '2018 Ford AP_000_Y', positionId: '2018-position-FAPPLN-0001-0ca216ebc1', status: 2, FTE: 0.7, confirmFlag: Y},

  {sowName: '2018 FCO_000_Y', positionId: '2018-position-FAPPLN-0001-0ca216ebc1', status: 2, FTE: 0.3, confirmFlag: testStartSow ? Y : N},

  // {sowName: '2018 Ford AP_000_Y', positionId: '2018-position-FAPPLN-0002-0ca216ebc1', status: 2, FTE: 1},

  {sowName: '2018 BackOffice_000_Y', positionId: '2018-position-FAPCTV-0001-0ca216ebc1', status: 2, FTE: 0.5, confirmFlag: Y},

]
let sowPositions = testStartSow ? [...sowPositions2018] : [...sowPositions2019, ...sowPositions2018]

let initSow = async t => {
  let
    positionLogs = [],
    salaryDistributions = []


  // 初始化 sow
  let $sows = await models.sow.bulkCreate(sows, {transaction: t})
  let $sowList = {}

  $sows.forEach($sow => {
    $sowList[`${$sow.name}_${$sow.version}_${$sow.isExecution}`] = $sow
  })

  // 初始化 clientPo
  await models.clientPo.bulkCreate(clientPos, {transaction: t})

  // 初始化 sowLevel
  await models.sowLevel.bulkCreate(sowLevels, {transaction: t})

  // 初始化 position
  for (let position of positions) {
    let $stdPos = await models.stdPos.findOne({
      where: {name: position.stdPosName},
      transaction: t
    })
    let stdPosDetailId = (await models.stdPosDetail.findOne({
      where: {
        stdPosId: $stdPos.id,
        skillLevel: position.skillLevel,
        year: parseInt(position.year) - 1
      },
      transaction: t
    })).id
    let option = {
      type: budgetType.stdPos,
      stdPosDetailId
    }
    let referInfo = ['location', 'currencyId', 'officeId', 'teamId']

    referInfo.forEach(key => {
      position[key] = $stdPos[key]
    })

    let budget = await queryPositionBudget(option, t)

    Object.assign(position, budget)
    position.stdPosId = $stdPos.id
    position.stdPosDetailId = stdPosDetailId

    position.sowLevel = await querySowLevel(position.directComp, position.currencyId, parseInt(position.year) - 1, t)
    position.FTE = getFTE(position.validDate, position.invalidDate)


    // 2018 年的 position 生成对应的 positionLog
    if (position.year === '2018') {
      let positionLogReferInfo = [
        'name', 'year',
        'titleId', 'fordFunctionId',
        'companyId', 'officeId', 'currencyId', 'teamId',
        'stdPosId', 'skillLevel', 'stdPosDetailId', 'location'
      ]

      for (let positionLog of position.positionLogs) {
        positionLogReferInfo.forEach(key => {
          positionLog[key] = position[key]
        })
        positionLog.positionId = position.id
        positionLogs.push(positionLog)

        for (let salaryDistribution of positionLog.salaryDistributions) {
          salaryDistribution.commonId = positionLog.id
          salaryDistributions.push(salaryDistribution)
        }
      }
    }
  }
  let $positions = await models.position.bulkCreate(positions, {transaction: t})
  let $positionList = {}

  $positions.forEach($position => {
    $positionList[$position.id] = $position
  })

  await models.positionLog.bulkCreate(positionLogs, {transaction: t})
  await models.salaryDistribution.bulkCreate(salaryDistributions, {transaction: t})


  // 初始化 sowPosition
  for (let sowPosition of sowPositions) {
    let $position = $positionList[sowPosition.positionId],
      cost = {
        net: $position.net,
        tax: $position.tax,
        gross: $position.gross,
        budgetIncentive: $position.budgetIncentive,
      }

    sowPosition.sowId = $sowList[sowPosition.sowName].id
    sowPosition.confirmFlag = [flowCfg.sowStatus.POCollected, flowCfg.sowStatus.special].includes($sowList[sowPosition.sowName].flowStatus) ? cfg.Y : cfg.N
    sowPosition.positionId = $position.id

    let $client = await models.client.findOne({
      where: {id: $sowList[sowPosition.sowName].clientId},
      transaction: t
    })

    Object.assign(sowPosition, getClientCostPure(cost, sowPosition.FTE, $client.incentiveRate, $client.taxDiscountRate, $position.officeId))
    await createOrUpdateOrDeleteSowPosition(sowPosition, t)
  }

}

exports.initSow = initSow
