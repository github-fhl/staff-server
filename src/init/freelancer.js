const
  {gender, staffType, recruitType, Y, salaryDistributionType, skillLevelType, costDistributionType, costType, freelancerSalaryType, taxType, accountType, accountTypeTax} = require('config').get('args'),
  {staffStatus, recruitStatus} = require('config').get('flowCfg'),
  {models} = require('../../models/index'),
  moment = require('moment'),
  NP = require('number-precision')

let freelancerInfos = [
  {
    id: 'freelancer-01-989b-11e7-a8d6-2357-01',
    name: 'Philomena', gender: gender.Female,
    companyId: 'GTB SH', titleId: '客户经理',

    stdPosId: 'stdpos-001-71-11e7-951e-9fc46ab347d2', skillLevel: skillLevelType.High, stdPosDetailId: 'stdPosDetial-01-e7-951e-9fc46ab347d2',
    // location/currencyId/officeId/teamId 根据 stdpos 得来

    staffType: staffType.Freelancer, flowStatus: staffStatus.Onboarded,

    staffHistorys: [{
      validFlag: Y, entryDate: '2018-01-02', leaveDate: '2018-09-22'
    }],

    recruits: [{
      id: 'F201801001',
      recruitType: recruitType.Freelancer,
      flowStatus: recruitStatus.Onboarded,
      freelancerCostDistributions: [{
        type: costDistributionType.position,
        commonId: '2018-position-FAPCTV-0001-0ca216ebc1',
        position: {
          name: 'FAPCTV 0001'
        },
        percentage: 0.4,
      }, {
        type: costDistributionType.project,
        commonId: 'PJ201801002--001--a8d6-2357-2357-wer',
        project: {
          name: 'PJ201801002'
        },
        percentage: 0.3,
      }, {
        type: costDistributionType.production,
        commonId: 'PE201801001',
        percentage: 0.3,
        production: {
          id: 'PE201801001'
        }
      }]
    }],

    freelancerContracts: [{
      id: 'freelancerContract-FC001-e33df21ebc1'
    }],

    estimateCfg: {
      salaryTypeId: freelancerSalaryType['Freelancer Daily Salary'],
      taxType: taxType.PreTax,
      accountType: accountType['CompanyAcct6%'],
      basicSalary: 50000,
      workdays: 22
    },

    salaryRecords: [{
      id: 'salaryRecord-f01-d8d-23991-erw057-02',
      date: '2018-01',

      salaryDistributions: [{
        type: salaryDistributionType.salaryRecord
      }]
    }, {
      id: 'salaryRecord-f02-d8d-23991-erw057-02',
      date: '2018-02',

      salaryDistributions: [{
        type: salaryDistributionType.salaryRecord
      }]
    }, {
      id: 'salaryRecord-f03-d8d-23991-erw057-02',
      date: '2018-03',

      salaryDistributions: [{
        type: salaryDistributionType.salaryRecord
      }]
    }]
  }
]

let initFreelancer = async t => {
  // 创建 Freelancer
  let
    staffHistorys = [],
    recruits = [],
    freelancerContracts = [],
    estimateSalarys = [],
    salaryRecords = [],
    salaryDistributions = [],
    costDistributions = []

  for (let freelancerInfo of freelancerInfos) {

    freelancerInfo.stdPosDetailId = (await models.stdPosDetail.findOne({
      transaction: t,
      where: {
        stdPosId: freelancerInfo.stdPosId,
        skillLevel: freelancerInfo.skillLevel
      }
    })).id
    // location/currencyId/officeId/teamId 根据 stdpos 录入 staffInfo 中
    let $stdPos = await models.stdPos.findOne({
      transaction: t,
      where: {id: freelancerInfo.stdPosId}
    })

    let referInfo = ['location', 'currencyId', 'officeId', 'teamId']

    referInfo.forEach(key => {
      freelancerInfo[key] = $stdPos[key]
    })


    // 生成 staffHistorys
    for (let staffHistory of freelancerInfo.staffHistorys) {
      staffHistorys.push({
        ...staffHistory,
        staffId: freelancerInfo.id
      })
    }

    // 生成 recruit
    for (let recruit of freelancerInfo.recruits) {
      recruit.entryDate = freelancerInfo.staffHistorys[0].entryDate
      recruit.leaveDate = freelancerInfo.staffHistorys[0].leaveDate
      recruit.staffName = freelancerInfo.name
      recruit.staffId = freelancerInfo.id

      recruit.basicInfo = {
        gender: freelancerInfo.gender,
        location: freelancerInfo.location,
        companyId: freelancerInfo.companyId,
        currencyId: freelancerInfo.currencyId,
        officeId: freelancerInfo.officeId,
        teamId: freelancerInfo.teamId,
        titleId: freelancerInfo.titleId,
        stdPosId: freelancerInfo.stdPosId,
        skillLevel: freelancerInfo.skillLevel,
        stdPosDetailId: freelancerInfo.stdPosDetailId,
      }
      let tempEstimateSalaries = []

      generatorEstimateSalarys(
        freelancerInfo.staffHistorys[0].entryDate,
        freelancerInfo.staffHistorys[0].leaveDate,
        {
          ...freelancerInfo.estimateCfg,
          staffId: freelancerInfo.id
        },
        tempEstimateSalaries
      )

      recruit.amount = 0
      recruit.freelancerEstimateSalaries = tempEstimateSalaries.map(tempEstimateSalary => {
        recruit.amount += tempEstimateSalary.gross
        delete tempEstimateSalary.staffId
        return tempEstimateSalary
      })

      for (let freelancerCostDistribution of recruit.freelancerCostDistributions) {
        freelancerCostDistribution.amount = NP.times(recruit.amount, freelancerCostDistribution.percentage)
        costDistributions.push({
          ...freelancerCostDistribution,
          costType: costType.freelancerContract,
          costCenterId: freelancerInfo.freelancerContracts[0].id
        })
      }

      recruit.freelancerContractId = freelancerInfo.freelancerContracts[0].id

      recruits.push(recruit)
    }

    // 生成 freelancerContract
    freelancerContracts.push({
      ...freelancerInfo.freelancerContracts[0],
      staffId: freelancerInfo.id,
      entryDate: freelancerInfo.staffHistorys[0].entryDate,
      leaveDate: freelancerInfo.staffHistorys[0].leaveDate,
      amount: freelancerInfo.recruits[0].amount,
      currencyId: freelancerInfo.currencyId
    })

    // 生成 estimateSalary
    generatorEstimateSalarys(
      freelancerInfo.staffHistorys[0].entryDate,
      freelancerInfo.staffHistorys[0].leaveDate,
      {
        ...freelancerInfo.estimateCfg,
        freelancerContractId: freelancerInfo.freelancerContracts[0].id,
        staffId: freelancerInfo.id,
        currencyId: freelancerInfo.currencyId
      },
      estimateSalarys
    )

    // 生成 SalaryRecords
    for (let salaryRecord of freelancerInfo.salaryRecords) {

      estimateSalarys.forEach(estimateSalary => {
        if (estimateSalary.staffId === freelancerInfo.id && estimateSalary.month === salaryRecord.date) {
          salaryRecord.amount = estimateSalary.gross
        }
      })

      salaryRecord.salaryDistributions.forEach(salaryDistribution => {
        salaryDistribution.commonId = salaryRecord.id
        salaryDistribution.salaryTypeId = freelancerInfo.estimateCfg.salaryTypeId
        salaryDistribution.amount = salaryRecord.amount
      })

      salaryDistributions.push(...salaryRecord.salaryDistributions)
      salaryRecords.push({
        ...salaryRecord,
        staffId: freelancerInfo.id,
        currencyId: freelancerInfo.currencyId
      })

      for (let freelancerCostDistribution of freelancerInfo.recruits[0].freelancerCostDistributions) {
        costDistributions.push({
          ...freelancerCostDistribution,
          costType: costType.salaryRecord,
          costCenterId: salaryRecord.id,
          amount: NP.times(salaryRecord.amount, freelancerCostDistribution.percentage)
        })
      }
    }
  }

  await models.staff.bulkCreate(freelancerInfos, {transaction: t})
  await models.staffHistory.bulkCreate(staffHistorys, {transaction: t})
  await models.freelancerContract.bulkCreate(freelancerContracts, {transaction: t})
  await models.recruit.bulkCreate(recruits, {transaction: t})
  await models.estimateSalary.bulkCreate(estimateSalarys, {transaction: t})
  await models.salaryRecord.bulkCreate(salaryRecords, {transaction: t})
  await models.salaryDistribution.bulkCreate(salaryDistributions, {transaction: t})
  await models.costDistribution.bulkCreate(costDistributions, {transaction: t})

}

exports.initFreelancer = initFreelancer

/**
 *
 * 生成 freelancer 的 estimateSalary
 * @param entryDate
 * @param leaveDate
 * @param estimateCfg
 *          - type
 *          - commonId
 *          - salaryTypeId
 *          - taxType
 *          - accountType
 *          - basicSalary
 *
 */

function generatorEstimateSalarys (entryDate, leaveDate, estimateCfg, estimateSalarys) {
  entryDate = moment(entryDate)
  leaveDate = moment(leaveDate)

  let newEntryDate = moment(entryDate),
    newLeaveDate = moment(leaveDate)

  if (entryDate.month() !== leaveDate.month()) {
    newLeaveDate = moment(newEntryDate).endOf('month')
    newEntryDate.add(1, 'M').startOf('month')

    generatorEstimateSalarys(newEntryDate, leaveDate, estimateCfg, estimateSalarys)
  }

  let diffDays = newLeaveDate.diff(entryDate, 'days') + 1,
    allDays = entryDate.daysInMonth(),
    net = 0,
    taxRate = accountTypeTax[estimateCfg.accountType],
    basicSalaryPreTax = estimateCfg.taxType === taxType.PreTax ? estimateCfg.basicSalary : estimateCfg.basicSalary / taxRate


  switch (estimateCfg.salaryTypeId) {
    case freelancerSalaryType['Freelancer Daily Salary']:
      net = basicSalaryPreTax * diffDays
      break
    case freelancerSalaryType['Freelancer Monthly Salary']:
      net = basicSalaryPreTax * (diffDays / allDays)
      break
    case freelancerSalaryType['Freelancer One Time Salary']:
      net = newLeaveDate !== leaveDate ? 0 : basicSalaryPreTax
      break
    default:
  }

  estimateSalarys.push({
    ...estimateCfg,
    month: entryDate.format('YYYY-MM'),
    net,
    gross: net * (1 + taxRate)
  })
}
