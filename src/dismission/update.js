const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  config = require('config'),
  {
    ToSubmit, FDRefused
  } = config.flowCfg.dismissionStatus

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true),
    new Arg('applicationDate', false),
    new Arg('leaveDate', false),
    new Arg('remark', false),
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  let $dismission = await models.dismission.findById(args.id, {transaction: t})

  if (!$dismission) throw new Error(`${args.id} 数据不存在`)

  for (let key in args) {
    $dismission[key] = args[key]
  }
  checkDismissionUpdate($dismission)

  await $dismission.save({transaction: t})
}

/**
 * 检查能否编辑
 * 1. 只有 ToSubmit, FDRefused 能够修改数据
 *
 * @param {object} $dismission 离职单
 * @return {null}
 */
function checkDismissionUpdate ($dismission) {
  if (![ToSubmit, FDRefused].includes($dismission.flowStatus)) {
    throw new Error(`当前状态为${$dismission.flowStatus}，无法进行编辑`)
  }
}
