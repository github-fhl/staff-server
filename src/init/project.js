const
  {models} = require('../../models/index'),
  NP = require('number-precision'),
  {ToSubmit, Disabled, POCollected} = require('config').get('flowCfg').projectStatus,
  {querySowLevel, queryPositionBudget} = require('../position'),
  {budgetType} = require('config').get('args'),
  {createProjectDetail} = require('../projectDetail/create')


let projects = [{
  id: 'PJ201801001--001--a8d6-2357-2357-wer',
  name: 'PJ201801001', version: '001',
  flowStatus: Disabled,
  projectDetails: [{
    companyId: 'GTB SH',
    fordFunctionId: 'Account Mgt. Service',
    stdPosDetailId: 'stdPosDetial-2018-0001-09fc46ab347d2',
    hours: 300,
  }, {
    companyId: 'GTB SH',
    fordFunctionId: 'Account Mgt. Service',
    stdPosDetailId: 'stdPosDetial-2018-0002-09fc46ab347d2',
    hours: 300,
  }]
}, {
  id: 'PJ201801001--002--a8d6-2357-2357-wer',
  name: 'PJ201801001', version: '002',
  flowStatus: ToSubmit,
  projectDetails: [{
    id: 'PJ201801001--Detail001--a8d6-2357-er',
    companyId: 'GTB SH',
    fordFunctionId: 'Account Mgt. Service',
    stdPosDetailId: 'stdPosDetial-2018-0001-09fc46ab347d2',
    hours: 300,
  }, {
    companyId: 'GTB SH',
    fordFunctionId: 'Account Mgt. Service',
    stdPosDetailId: 'stdPosDetial-2018-0002-09fc46ab347d2',
    hours: 300,
  }, {
    companyId: 'GTB SH',
    fordFunctionId: 'Account Mgt. Service',
    stdPosDetailId: 'stdPosDetial-2018-0003-09fc46ab347d2',
    hours: 300,
  }]
}, {
  id: 'PJ201801002--001--a8d6-2357-2357-wer',
  name: 'PJ201801002', version: '001',
  flowStatus: POCollected,
  poCode: 'PO201801001', fee: 100000, productionCost: 200000, poFilePath: 'clientPo/路径-1513506678321.txt',
  totalAmount: 200000,
  projectDetails: [{
    companyId: 'GTB SH',
    fordFunctionId: 'Account Mgt. Service',
    stdPosDetailId: 'stdPosDetial-2018-0001-09fc46ab347d2',
    hours: 100,
  }, {
    companyId: 'GTB SH',
    fordFunctionId: 'Account Mgt. Service',
    stdPosDetailId: 'stdPosDetial-2018-0002-09fc46ab347d2',
    hours: 200,
  }, {
    companyId: 'GTB SH',
    fordFunctionId: 'Account Mgt. Service',
    stdPosDetailId: 'stdPosDetial-2018-0003-09fc46ab347d2',
    hours: 300,
  }]
}]

let sameField = {
  year: 2018,
  description: '描述',
  inChargeAccount: 'Lamda',
  clientId: 'Ford AP',
  currencyId: 'RMB',
}

projects = projects.map(project => ({
  ...project,
  ...sameField
}))

let initProject = async t => {
  for (let project of projects) {
    await models.project.create(project, {transaction: t})

    for (let projectDetail of project.projectDetails) {
      let $stdPosDetail = await models.stdPosDetail.findById(projectDetail.stdPosDetailId, {
        transaction: t,
        include: [{
          model: models.stdPos,
          as: 'stdPos'
        }, {
          model: models.stdPosPrice,
          where: {
            salaryTypeId: 'Monthly Salary'
          }
        }]
      })

      let referField = ['teamId', 'officeId', 'currencyId']

      projectDetail.projectId = project.id
      projectDetail.stdPosId = $stdPosDetail.stdPos.id
      projectDetail.skillLevel = $stdPosDetail.skillLevel
      referField.forEach(field => {
        projectDetail[field] = $stdPosDetail.stdPos[field]
      })

      let $officeDetail = await models.officeDetail.findOne({
        transaction: t,
        where: {
          year: project.year,
          officeId: projectDetail.officeId
        }
      })

      let option = {
        type: budgetType.stdPos,
        stdPosDetailId: projectDetail.stdPosDetailId
      }

      let {directComp, directLabor} = await queryPositionBudget(option, t)

      projectDetail.FTE = NP.divide(projectDetail.hours, 1600)
      projectDetail.annualSalary = NP.times($stdPosDetail.stdPosPrices[0].amount, 12)

      projectDetail.mulRate = $officeDetail.mulRate
      projectDetail.annualNet = NP.times(directLabor, projectDetail.mulRate)
      projectDetail.net = NP.times(projectDetail.annualSalary, projectDetail.FTE).simpleFixed(0)
      projectDetail.budgetAmount = NP.times(directLabor, projectDetail.FTE).simpleFixed(0)
      projectDetail.sowLevel = await querySowLevel(directComp, projectDetail.currencyId, project.year, t)

      await createProjectDetail(projectDetail, t)
    }
  }
}

exports.initProject = initProject
