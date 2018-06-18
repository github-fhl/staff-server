const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {getClientCostPure} = require('./pureFn'),
  NP = require('number-precision'),
  {cfg} = require('config'),
  {clientType} = cfg

const getData = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('sowId', true),
    new Arg('positionId', true),
    new Arg('FTE', true, 'number'),
    new Arg('totalFTE', true, 'number'), // position 的总 FTE
  ]

  if (!api.setArgs(receiveArgs)) return

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 * 根据 sowPosition 的 FTE 变更，判断对应 InHouse 的 FTE
 * 1. 校验
 * 2. 计算 正式 sowPosition 对应的金额
 * 3. 如果是 GTB SH ，那么应该将剩下的 FTE 塞入 InHouse 中
 */

async function run (args, t) {
  let $sow = await models.sow.findByPrimary(args.sowId, {
    transaction: t
  })
  let $position = await models.position.findByPrimary(args.positionId, {
    transaction: t
  })
  let $inHouseSow = await models.sow.findOne({
    transaction: t,
    where: {
      year: $sow.year,
      isExecution: $sow.isExecution,
      sowType: cfg.clientType.InHouse
    }
  })
  let $sowPositions = await models.sowPosition.findAll({
    where: {
      status: $sow.isExecution === cfg.N ? 1 : 2,
      sowId: {$notIn: [$sow.id, $inHouseSow.id]},
      positionId: args.positionId
    },
    transaction: t
  })
  let otherFTE = 0

  $sowPositions.forEach($sowPosition => otherFTE = NP.plus(otherFTE, $sowPosition.FTE))


  check(args, t)

  $sowPositions.push(await calculate($sow.id, $position.id, args.FTE, t))

  if (
    $position.companyId === cfg.coreCompany &&
    args.FTE <= args.totalFTE &&
    $sow.sowType !== clientType.InHouse
  ) {
    $sowPositions.push(await calculate($inHouseSow.id, $position.id, NP.minus(args.totalFTE, args.FTE, otherFTE), t))
  }

  return $sowPositions
}

exports.getData = getData

function check (args, t) {
  if (args.FTE > args.totalFTE) throw new Error('MAX FTE Must Be Equal Total FTE')
}

/**
 * 计算单个 sowPosition 的金额
 */

async function calculate (sowId, positionId, FTE, t) {
  let $sow = await models.sow.findByPrimary(sowId, {
    transaction: t
  })
  let $position = await models.position.findByPrimary(positionId, {
    transaction: t
  })
  let cost = {
    net: $position.net,
    tax: $position.tax,
    gross: $position.gross,
    budgetIncentive: $position.budgetIncentive,
  }
  let $client = await models.client.findOne({
    transaction: t,
    where: {id: $sow.clientId},
  })
  let sowPosition = {
    ...getClientCostPure(cost, FTE, $client.incentiveRate, $client.taxDiscountRate, $position.officeId),
    sowId: $sow.id
  }
  let $sowPosition = await models.sowPosition.findOne({
    where: {
      sowId,
      positionId
    },
    transaction: t
  })

  if ($sowPosition) sowPosition.id = $sowPosition.id

  return sowPosition
}
