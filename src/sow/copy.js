
const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {getNewSowInfoForSoldMixed} = require('./getNewSowInfoForSoldMixed'),
  {getInitFlowStatus} = require('./pureFn'),
  {createOrUpdateOrDeleteSowPosition} = require('../sowPosition/mixedFn'),
  {disableHistorySow, checkPositionFTENoMore1, getNewSowVersion} = require('./mixedFn'),
  {SowMachine} = require('./stateMachine/sowMachine'),
  {POCollected} = require('config').get('flowCfg').sowStatus

let attrsSow = ['name', 'year', 'version', 'clientId', 'sowType', 'currencyId']
  // , 'media', 'production', 'traditional', 'digital', 'CRM', 'travel', 'total'

let copy = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('targetSowId', true)
  ]

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, req.user, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}


/**
 * 1、创建 sow
 * 2、创建 sowPosition，将 sow 和 position 关联起来
 * 3、disable 历史版本
 * 4、检查 position 的 FTE，不能超过1
 *
 * @param {object} args 前端传递的参数
 * @param {object} user 登录用户
 * @param {object} t transaction
 * @return {object}
 */
async function run (args,  user, t) {
  let $targetSow = await models.sow.findOne({
    where: {id: args.targetSowId},
    transaction: t,
    attributes: attrsSow
  })

  if (!$targetSow) throw new Error(`${args.targetSowId} 不存在`)
  await checkSowCopy($targetSow.name, parseInt($targetSow.year), t)

  $targetSow.dataValues.version = await getNewSowVersion($targetSow.name, $targetSow.year)
  $targetSow.dataValues.flowStatus = getInitFlowStatus($targetSow.sowType)

  let $newSow = await models.sow.create($targetSow.dataValues, {transaction: t})

  await (new SowMachine($newSow, user, t)).init().create()

  let {positionCosts} = await getNewSowInfoForSoldMixed(args.targetSowId, $targetSow.year, t)

  for (let name in positionCosts) {
    let positionCost = positionCosts[name]
    let sowPosition = Object.assign(
      {
        sowId: $newSow.id,
        positionId: positionCost.newPositionId
      },
      positionCost.sowPositionCost
    )

    await createOrUpdateOrDeleteSowPosition(sowPosition, t)
  }

  $newSow = await models.sow.findOne({
    where: {id: $newSow.id},
    transaction: t
  })

  await disableHistorySow($newSow.id, t)
  await checkPositionFTENoMore1($newSow.id, t)
  return $newSow
}

exports.copy = copy

/** 检测是否能够进行复制 sow 操作
 * 1. 能够复制的年份，当年、当年年份 + 1
 * 2. 如果存在 POCollected 的 sow，则不能进行复制
 *
 * @param {string} sowName 复制的 sow 的 name
 * @param {number} year 复制的 sow 年份
 * @param {object} t transaction
 * @return {null}
 */
async function checkSowCopy (sowName, year, t) {
  let nowYear = (new Date()).getFullYear()

  if (year !== nowYear && year !== nowYear + 1) throw new Error(`无法复制生成 ${year} 年的 sow`)

  let $checkSow = await models.sow.findOne({
    transaction: t,
    where: {
      name: sowName,
      year,
      flowStatus: POCollected
    }
  })

  if ($checkSow) throw new Error(`${$checkSow.name}-${$checkSow.version} 的状态为 ${$checkSow.flowStatus}，无法进行复制操作`)

  return null
}
