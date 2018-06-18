const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {checkSowNameUnique} = require('./mixedFn'),
  {getInitFlowStatus} = require('./pureFn'),
  {SowMachine} = require('./stateMachine/sowMachine')

let create = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = Arg.factory(models.sow)

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, req.user, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}


async function run (args, user, t) {
  await checkSowNameUnique(args.name, t)
  checkCreateSow(parseInt(args.year))
  args.flowStatus = getInitFlowStatus(args.sowType)

  let $sow = await models.sow.create(args, {transaction: t})

  await (new SowMachine($sow, user, t)).init().create()

  return $sow
}

exports.create = create

/** 检查是否能够创建 sow
 * 1. 只能是创建次年的 sow
 *
 * @param {number} year sow 对应的年份
 * @return {null}
 */
function checkCreateSow (year) {
  let nowYear = (new Date()).getFullYear()

  if (year !== nowYear + 1) throw new Error(`无法创建 ${year} 年份的 sow，只能创建 ${nowYear + 1} 年份的 sow`)
}
