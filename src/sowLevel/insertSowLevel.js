const
  {models} = require('../../models/index'),
  {getDirectCompBySalaryDistribution} = require('../salaryDistribution/getDirectCompBySalaryDistribution'),
  {staffType} = require('config').get('args'),
  {Onboarded} = require('config').get('flowCfg').staffStatus,
  NP = require('number-precision'),
  moment = require('moment')

async function insertSowLevel (t) {

  let nowDate = moment().format('YYYY-MM')
  let $staffs = await models.staff.findAll({
    transaction: t,
    where: {
      officeId: {$in: ['Shanghai Offsite', 'Shanghai Onsite']},
      staffType: staffType.Regular,
      flowStatus: Onboarded
    },
    include: [{
      model: models.salaryStructure,
      where: {
        validDate: {$lte: nowDate}
      },
      limit: 1,
      order: [['validDate', 'DESC']],
      separate: true,
      include: [{
        model: models.salaryDistribution,
        separate: true,
        include: [{
          model: models.salaryType
        }]
      }]
    }]
  })

  let directComps = []

  for (let $staff of $staffs) {
    directComps.push(getDirectCompBySalaryDistribution($staff.salaryStructures[0].salaryDistributions, $staff.location))
  }

  directComps.sort((a, b) => a - b)
  let sowLevel = {year: moment().year()}

  for (let i = 1; i <= 4; i++) {
    let index = parseInt(NP.times(NP.divide(directComps.length, 5), i))

    sowLevel[`level${i}Max`] = directComps[index]
  }

  await models.sowLevel.destroy({
    transaction: t,
    where: {year: moment().year()}
  })

  await models.sowLevel.create(sowLevel, {transaction: t})
}
exports.insertSowLevel = insertSowLevel
