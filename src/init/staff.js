const
  {gender, location, staffType, Y, N, salaryDistributionType, skillLevelType, costType, costDistributionType} = require('config').get('args'),
  {staffStatus, positionLogStatus, recruitStatus} = require('config').get('flowCfg'),
  {models} = require('../../models/index'),
  moment = require('moment'),
  {calculateSocialTax} = require('../systems/company')

let staffInfos = [

  /**
   * ************************* 第一名 staff ********************
   */

  {
    id: 'staff-01-989b-11e7-a8d6-239091057-01',
    name: 'Emma', gender: gender.Female,
    companyId: 'GTB SH', titleId: '客户经理',

    stdPosId: 'stdpos-001-71-11e7-951e-9fc46ab347d2', skillLevel: skillLevelType.High,
    // location/currencyId/officeId/teamId 根据 stdpos 得来

    staffType: staffType.Regular, flowStatus: staffStatus.Onboarded,

    staffHistorys: [{
      validFlag: Y, entryDate: moment('2018-01-02'), increaseCycle: 12, nextIncreaseMonth: '2018-07', noticePeriod: 3
    }],

    monthlySalary: 1000000,
    salaryStructures: [{
      id: 'salaryStructures-01-d8d6-23991057-02',
      validDate: '2018-01',

      salaryDistributions: [{
        type: salaryDistributionType.salaryStructure,
        salaryTypeId: 'Monthly Salary', amount: 1000000
      }, {
        type: salaryDistributionType.salaryStructure,
        salaryTypeId: 'Salary Increase', amount: 500000
      }, {
        type: salaryDistributionType.salaryStructure,
        salaryTypeId: 'Meal', amount: 300000
      }]
    }],

    salaryRecords: [{
      id: 'salaryRecord-01-d8d6-23991-erw057-02',
      date: '2018-01',

      salaryDistributions: [{
        type: salaryDistributionType.salaryRecord,
        salaryTypeId: 'Monthly Salary', amount: 900000
      }, {
        type: salaryDistributionType.salaryRecord,
        salaryTypeId: 'Meal', amount: 300000
      }]
    }],

    positionLogs: [{
      id: 'positionLog-2018-FAPCTV-0001-216ebc1',

      entryDate: moment('2018-01-02'), flowStatus: positionLogStatus.Closed,

      salaryDistributions: [{
        type: salaryDistributionType.positionLog,
        salaryTypeId: 'Monthly Salary', amount: 1000000
      }, {
        type: salaryDistributionType.positionLog,
        salaryTypeId: 'Meal', amount: 300000
      }],

      recruits: [{
        id: 'R201801001',
        flowStatus: recruitStatus.Onboarded,
        inLogOldStatus: positionLogStatus.Open
      }]
    }]
  },

  /**
   * ************************* 第二名 staff ********************
   */

  {
    id: 'staff-02-989b-11e7-a8d6-239091057-02',
    name: 'James', gender: gender.Male,
    companyId: 'GTB SH', titleId: '客户经理',

    stdPosId: 'stdpos-002-71-11e7-951e-9fc46ab347d2', skillLevel: skillLevelType.High,

    staffType: staffType.Regular, flowStatus: staffStatus.Onboarded,

    staffHistorys: [{
      validFlag: Y, entryDate: moment('2018-01-05'), increaseCycle: 18, nextIncreaseMonth: '2019-01', noticePeriod: 3
    }],

    monthlySalary: 1500000,
    salaryStructures: [{
      id: 'salaryStructures-02-d86-239091057-02',
      validDate: '2018-01',

      salaryDistributions: [{
        salaryTypeId: 'Monthly Salary', amount: 1500000
      }, {
        salaryTypeId: 'Salary Increase', amount: 300000
      }, {
        salaryTypeId: 'COLA', amount: 500000
      }]
    }],

    salaryRecords: [{
      id: 'salaryRecord-02-d8d6-23991-erw057-02',
      date: '2018-01',

      salaryDistributions: [{
        salaryTypeId: 'Monthly Salary', amount: 1600000
      }, {
        salaryTypeId: 'COLA', amount: 400000
      }]
    }],

    positionLogs: [{
      id: 'positionLog-2018-FAPPLN-0001-216ebc1',

      entryDate: moment('2018-01-05'), flowStatus: positionLogStatus.Closed,

      salaryDistributions: [{
        salaryTypeId: 'Monthly Salary', amount: 1500000
      }, {
        salaryTypeId: 'COLA', amount: 500000
      }],

      recruits: [{
        id: 'R201801002',
        flowStatus: recruitStatus.Onboarded,
        inLogOldStatus: positionLogStatus.Open
      }]
    }]
  }
]

let increasePools = [{
  increaseMonth: '2018-01',
  currencyId: 'RMB',
  amount: 100000000
}, {
  increaseMonth: '2018-07',
  currencyId: 'RMB',
  amount: 50000000
}]


let initStaff = async t => {
  // 创建 staff
  let
    staffHistorys = [],
    increaseLogs = [],
    salaryStructures = [],
    salaryRecords = [],
    costDistributions = [],
    salaryDistributions = [],
    positionLogs = [],
    recruits = []

  for (let staffInfo of staffInfos) {

    staffInfo.stdPosDetailId = (await models.stdPosDetail.findOne({
      transaction: t,
      where: {
        stdPosId: staffInfo.stdPosId,
        skillLevel: staffInfo.skillLevel
      }
    })).id
    // location/currencyId/officeId/teamId 根据 stdpos 录入 staffInfo 中
    let $stdPos = await models.stdPos.findOne({
      transaction: t,
      where: {id: staffInfo.stdPosId}
    })

    let referInfo = ['location', 'currencyId', 'officeId', 'teamId']

    referInfo.forEach(key => {
      staffInfo[key] = $stdPos[key]
    })

    // 生成 staffHistorys
    for (let staffHistory of staffInfo.staffHistorys) {
      staffHistorys.push({
        ...staffHistory,
        staffId: staffInfo.id
      })

      // 生成对应的加薪 log
      // 在 2018-01 加过一次薪水


      increaseLogs.push({
        staffId: staffInfo.id,
        increased: Y,
        increaseMonth: '2018-01',
        increaseRate: 0.2,
        monthlySalary: staffInfo.monthlySalary,
        salaryIncrease: staffInfo.monthlySalary * 0.2,
      }, {
        staffId: staffInfo.id,
        increased: N,
        increaseMonth: staffHistory.nextIncreaseMonth
      })
    }

    // 生成 salaryStructures
    for (let salaryStructure of staffInfo.salaryStructures) {
      salaryStructures.push({
        ...salaryStructure,
        staffId: staffInfo.id,
        currencyId: staffInfo.currencyId
      })

      // 生成 salaryStructures.salaryDistributions
      let tempSalaryDistributions = await generatorSalaryDistributions(
        salaryStructure.salaryDistributions,
        salaryStructure.id,
        salaryDistributionType.salaryStructure,
        staffInfo.companyId,
        staffInfo.location,
        t
      )

      staffInfo.salaryStructures[0].salaryDistributions = tempSalaryDistributions

      salaryDistributions = [...salaryDistributions, ...tempSalaryDistributions]
    }

    // 生成 salaryRecord
    for (let salaryRecord of staffInfo.salaryRecords) {

      // 生成 salaryRecord.salaryDistributions
      // 生成 social Tax 的 salaryDistribution
      let tempSalaryDistributions = await generatorSalaryDistributions(
        salaryRecord.salaryDistributions,
        salaryRecord.id,
        salaryDistributionType.salaryRecord,
        staffInfo.companyId,
        staffInfo.location,
        t
      )

      salaryDistributions = [...salaryDistributions, ...tempSalaryDistributions]

      let totalAmount = tempSalaryDistributions.reduce((sum, item) => sum + item.amount, 0)

      salaryRecords.push({
        ...salaryRecord,
        staffId: staffInfo.id,
        amount: totalAmount,
        currencyId: staffInfo.currencyId
      })

      // 生成 salaryRecord.costDistribution 项目费用分配
      let $positionLog = await models.positionLog.findById(staffInfo.positionLogs[0].id, {transaction: t})

      costDistributions.push({
        costType: costType.salaryRecord,
        costCenterId: salaryRecord.id,
        type: costDistributionType.position,
        commonId: $positionLog.positionId,
        percentage: 1,
        amount: totalAmount
      })
    }

    // 根据 staff 的信息，更新 positionLog
    for (let positionLog of staffInfo.positionLogs) {

      // sowLevel
      referInfo = ['companyId', 'officeId', 'currencyId', 'teamId', 'stdPosId', 'skillLevel', 'stdPosDetailId', 'location']
      referInfo.forEach(key => {
        positionLog[key] = staffInfo[key]
      })
      positionLog.staffId = staffInfo.id
      positionLogs.push(positionLog)

      // 废弃 positionLog 旧的 salaryDistribution
      await models.salaryDistribution.destroy({
        transaction: t,
        where: {
          type: salaryDistributionType.positionLog,
          commonId: positionLog.id
        }
      })
      // 生成 positionLog.salaryDistributions
      let tempSalaryDistributions = await generatorSalaryDistributions(
        positionLog.salaryDistributions,
        positionLog.id,
        salaryDistributionType.positionLog,
        staffInfo.companyId,
        staffInfo.location,
        t
      )

      salaryDistributions = [...salaryDistributions, ...tempSalaryDistributions]


      // 生成对应的招聘单
      for (let recruit of positionLog.recruits) {
        recruit.entryDate = staffInfo.staffHistorys[0].entryDate
        recruit.staffName = staffInfo.name
        recruit.staffId = staffInfo.id
        recruit.recruitType = staffInfo.staffType
        recruit.positionLogId = positionLog.id

        recruit.basicInfo = {
          gender: staffInfo.gender,
          location: staffInfo.location,
          companyId: staffInfo.companyId,
          currencyId: staffInfo.currencyId,
          officeId: staffInfo.officeId,
          teamId: staffInfo.teamId,
          titleId: staffInfo.titleId,
          stdPosId: staffInfo.stdPosId,
          skillLevel: staffInfo.skillLevel,
          stdPosDetailId: staffInfo.stdPosDetailId,
        }
        recruit.inLogSalaryDistributions = tempSalaryDistributions.map(tempSalaryDistribution => ({
          amount: tempSalaryDistribution.amount,
          salaryTypeId: tempSalaryDistribution.salaryTypeId
        }))
        recruit.staffSalaryDistributions = staffInfo.salaryStructures[0].salaryDistributions.map(salaryDistribution => ({
          amount: salaryDistribution.amount,
          salaryTypeId: salaryDistribution.salaryTypeId
        }))

        recruits.push(recruit)
      }
    }
  }

  await models.staff.bulkCreate(staffInfos, {transaction: t})
  await models.staffHistory.bulkCreate(staffHistorys, {transaction: t})
  await models.increaseLog.bulkCreate(increaseLogs, {transaction: t})
  await models.increasePool.bulkCreate(increasePools, {transaction: t})
  await models.salaryStructure.bulkCreate(salaryStructures, {transaction: t})
  await models.salaryRecord.bulkCreate(salaryRecords, {transaction: t})
  for (let positionLog of positionLogs) {
    await models.positionLog.update(positionLog, {
      where: {id: positionLog.id},
      transaction: t
    })
  }
  await models.costDistribution.bulkCreate(costDistributions, {transaction: t})
  await models.salaryDistribution.bulkCreate(salaryDistributions, {transaction: t})
  await models.recruit.bulkCreate(recruits, {transaction: t})
}

exports.initStaff = initStaff

/**
 * 生成 salaryStructure、salaryRecord、positionLog 对应的 salaryDistribution
 *
 * 1. 对应生成 social tax
 *
 * @param {array} salaryDistributions 数组
 * @param {string} mainId 对应类别的 id
 * @param {string} type 类别
 * @param {string} companyId 公司
 * @param {string} locationType 本地/外籍
 * @param {object} t transaction
 * @returns {null}
 */
async function generatorSalaryDistributions (salaryDistributions, mainId, type, companyId, locationType, t) {
  let
    tempSalaryDistributions = [],
    increaseAmount = 0

  salaryDistributions.forEach(salaryDistribution => {
    if (salaryDistribution.salaryTypeId === 'Salary Increase') increaseAmount = salaryDistribution.amount
  })

  for (let salaryDistribution of salaryDistributions) {
    tempSalaryDistributions.push({
      ...salaryDistribution,
      commonId: mainId,
      type: salaryDistributionType[type]
    })

    // 增加 social tax、13th salary
    if (salaryDistribution.salaryTypeId === 'Monthly Salary' && locationType === location.Local) {
      let socialTax = await calculateSocialTax(salaryDistribution.amount + increaseAmount, companyId, '2018', t)

      tempSalaryDistributions.push({
        commonId: mainId,
        type: salaryDistributionType[type],
        salaryTypeId: 'Social Taxes',
        amount: socialTax
      })

      if ([salaryDistributionType.salaryStructure, salaryDistributionType.positionLog].includes(type)) {
        tempSalaryDistributions.push({
          commonId: mainId,
          type: salaryDistributionType[type],
          salaryTypeId: '13th Salary',
          amount: salaryDistribution.amount + increaseAmount
        })
      }
    }
  }

  return tempSalaryDistributions
}
