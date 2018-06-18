const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {Open, Recruiting, Closed, TransferringIn, TransferredIn, Leaving} = require('config').get('flowCfg').positionLogStatus


exports.getHCCategory = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('name', true), new Arg('year', true)
  ]

  if (!api.setArgs(receiveArgs)) return

  queryHCCategory(api.args.name, parseInt(api.args.year))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 * 获取 position 的 HCCategory
 * 1. 如果是新创建的，那么就是 2018 New
 * 2. 如果之前就有该position，那么对应的查看其当前状态
 *      - 有人，则 Jan 1 Closed
 *      - 没人，则 Jan 1 Open
 *
 * @param {string} name position 的名称
 * @param {number} year 新 sow 的对应年份
 * @param {object} t transaction
 * @return {null}
 */

async function queryHCCategory (name, year, t) {
  let $position = await models.position.findOne({
    transaction: t,
    where: {
      name,
      year: parseInt(year) - 1
    },
    include: [{
      model: models.positionLog,
      limit: 1,
      order: [['seqNo', 'DESC']],
      separate: true
    }]
  })

  if (!$position) return `${year} New`

  let
    closed = [Closed, TransferredIn, Leaving],
    open = [Open, Recruiting, TransferringIn]

  if (closed.includes($position.positionLogs[0].flowStatus)) return 'Jan 1 Closed'
  if (open.includes($position.positionLogs[0].flowStatus)) return 'Jan 1 Open'

  return null
}
exports.queryHCCategory = queryHCCategory
