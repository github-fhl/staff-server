const
  {modelPath, srcPath, cfg, flowCfg} = require('config'),
  {models} = require(modelPath),
  {getDirectCompBySalaryDistribution} = require(srcPath).salaryDistribution,
  {getExcRate} = require(srcPath).systems.currency,
  {staffType, RMB} = cfg,
  {Onboarded} = flowCfg.staffStatus,
  NP = require('number-precision'),
  moment = require('moment')

async function create (year, t) {
  check(year)

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
  let sowLevel = {
    year: moment().year(),
    currencyId: RMB
  }

  for (let $staff of $staffs) {
    let directComp = getDirectCompBySalaryDistribution($staff.salaryStructures[0].salaryDistributions, $staff.location)
    let {constantRate} = await getExcRate($staff.currencyId, sowLevel.currencyId, year, t)

    directComps.push(NP.divide(directComp, constantRate))
  }

  directComps.sort((a, b) => a - b)

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
module.exports = create

/**
 * 检查创建 sowLevel
 * 1. 年份必须是今年
 */

function check (year) {
  let nowYear = moment().year()

  if (year !== nowYear) throw new Error(`只能生成 ${nowYear} 年的 SoW Level`)
}

