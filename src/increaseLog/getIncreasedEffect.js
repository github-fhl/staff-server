const
  {models} = require('../../models/index'),
  {Y} = require('config').get('args'),
  NP = require('number-precision')

/**
 * 获取对应月份的加薪影响
 * 1. 获取对应月份的所有已加过薪的 increaseLog
 * 2. 判断是 7 月还是 1 月
 *    1. 1 月，今年影响 & 来年影响 = salaryIncrease * 12
 *    2. 7 月，今年影响 = salaryIncrease * 6，来年影响 = salaryIncrease * 12
 * @return {Promise<{nowYearIncreasedEffect: number, nextYearIncreasedEffect: number}>}
 *    - nowYearIncreasedEffect 今年的加薪影响
 *    - nextYearIncreasedEffect 来年的加薪影响
 */

async function getIncreasedEffect (increaseMonth, t) {
  let $increaseLogs = await models.increaseLog.findAll({
    transaction: t,
    where: {
      increaseMonth,
      increased: Y
    },
    include: [{
      model: models.staff
    }]
  })
  let
    nowYearIncreasedEffect = 0,
    nextYearIncreasedEffect = 0,
    nowYearMultiple = 1,
    nextYearMultiple = 1

  if (increaseMonth.endsWith('01')) {
    nowYearMultiple = 12
    nextYearMultiple = 12
  }

  if (increaseMonth.endsWith('07')) {
    nowYearMultiple = 6
    nextYearMultiple = 12
  }

  $increaseLogs.forEach($increaseLog => {
    nowYearIncreasedEffect = NP.plus(nowYearIncreasedEffect, NP.times($increaseLog.salaryIncrease, nowYearMultiple))
    nextYearIncreasedEffect = NP.plus(nextYearIncreasedEffect, NP.times($increaseLog.salaryIncrease, nextYearMultiple))
  })

  return {
    nowYearIncreasedEffect,
    nextYearIncreasedEffect
  }
}

exports.getIncreasedEffect = getIncreasedEffect
