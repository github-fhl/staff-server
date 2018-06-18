const
  {ApiDialect} = require('api-dialect'),
  {models} = require('../../models/index')

const
  attrMainCfg = ['id']

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)

  getTitles(api)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 *
 * @param {object} api 参数
 * @returns {Promise.<{rows: *, count}>}
 */
async function getTitles (api) {
  let $titles = await models.title.findAll({
    attributes: attrMainCfg,
    order: 'id ASC'
  })

  return {rows: $titles, count: $titles.length}
}
exports.getTitles = getTitles

/**
 * 创建 id，
 *
 * 在录入 position 时，如果不存在该 id，则创建之
 * @param {string} id title id
 * @param {object} t transaction
 * @return {boolean} createdTitle 是否创建 title
 */
const addTitle = async (id, t) => {
  let [, createdTitle] = await models.title.findOrCreate({
    where: {id},
    defaults: {id},
    transaction: t
  })

  return createdTitle
}

exports.addTitle = addTitle
