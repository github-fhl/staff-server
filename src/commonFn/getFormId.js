const
  moment = require('moment'),
  {models} = require('../../models/index'),
  {formType} = require('config').get('args')

/**
 * 获取四种申请单的 Id
 * 1. 首字母：招聘 -> R，转岗 -> T，离职 -> D，延期 -> E，
 * 2. 排序 YYYYMM + 3 位的排序号
 *
 * @param {object} date 日期
 * @param {string} type form 单的类别
 * @param {object} t transaction
 * @return {string}
 */
async function getFormId (date, type, t) {
  let initial = {
    recruit: 'R',
    recruitFreelancer: 'F',
    transfer: 'T',
    dismission: 'D',
    extension: 'E'
  }
  let model = type !== formType.recruitFreelancer ? models[type] : models.recruit

  let str = initial[type] + moment(date).format('YYYYMM')
  let maxId = await model.max('id', {
    transaction: t,
    where: {
      id: {$like: `${str}%`}
    }
  })

  if (!maxId) return `${str}001`
  return str + (parseInt(maxId.substr(-3)) + 1).prefix0(3)
}
module.exports = getFormId
