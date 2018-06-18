const
  moment = require('moment'),
  {models} = require('../../models/index')

/**
 * 获取 project production id
 * 1. 首字母：project -> PJ，production -> PE
 * 2. 排序 YYYYMM + 3 位的排序号
 *
 * @param {object} date 日期
 * @param {string} key 字段名
 * @param {string} type 类别
 * @param {object} t transaction
 * @return {string}
 */
async function getCommonId (date, key, type, t) {
  let initial = {
    project: 'PJ',
    production: 'PE',
  }
  let model = models[type]

  let str = initial[type] + moment(date).format('YYYYMM')
  let maxKey = await model.max(key, {
    transaction: t,
    where: {
      [key]: {$like: `${str}%`}
    }
  })

  if (!maxKey) return `${str}001`
  return str + (parseInt(maxKey.substr(-3)) + 1).prefix0(3)
}
module.exports = getCommonId
