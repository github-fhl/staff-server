const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {createOrUpdateOrDeleteSowPosition} = require('./mixedFn'),
  cfg = require('config').get('args'),
  {Create, Update, Delete, NoChange} = cfg.operation,
  {N, Y} = cfg,
  {toSubmit, special, refusedByClient, refusedByFD, POCollected} = require('config').get('flowCfg').sowStatus

const create = (req, res) => {
  let api = new ApiDialect(req, res)

  /**
   * {array} sowPositions
   *    - id 根据是否存在 id，来判断是创建还是编辑
   *    - sowId sow 的 ID
   *    - FTE 分配的 FTE
   *    - net net 金额
   *    - tax 金额
   *    - gross
   *    - incentive
   *    - grandTotal
   */

  let receiveArgs = [
    new Arg('positionId', true),
    new Arg('validDate', true),
    new Arg('invalidDate', true),
    new Arg('FTE', true),
    new Arg('sowPositions', true),
    new Arg('noteContent', false),
  ]

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  let $position = await models.position.findOne({
    where: {id: args.positionId},
    transaction: t
  })

  if (!$position) throw new Error(`${args.id} 不存在`)

  await checkUpdateSowPosition(args.sowPositions, $position.year, t)

  await $position.update({
    validDate: args.validDate,
    invalidDate: args.invalidDate,
    FTE: args.FTE
  })

  for (let sowPosition of args.sowPositions) {
    sowPosition.positionId = args.positionId

    if (args.noteContent) {
      let positionNote = {
        positionId: args.positionId,
        noteContent: args.noteContent,
        sowId: sowPosition.sowId,
        beforeFTE: sowPosition.beforeFTE,
        afterFTE: sowPosition.FTE,
      }

      await models.positionNote.create(positionNote, {transaction: t})
    }

    await createOrUpdateOrDeleteSowPosition(sowPosition, t)
  }
}

exports.create = create

/**
 * 检查是否允许操作 sowPosition，并标识当前操作类型
 *
 * 是否允许操作：
 *
 *    1. 如果对应年份是 nowYear
 *        1. sow 为 execution，检查所有 execution 是否都为已录入 po，是则允许操作
 *        2. sow 为非 execution，且对应 sow 为待提交 || special，则允许操作
 *    2. 如果对应年份是 nowYear + 1，且对应 sow 为待提交 || special，则允许操作
 *
 *
 * 操作类型：
 *    1. 没有 id，则代表 create
 *    2. 有 id，且 FTE 与之前相同，则 noChange
 *    3. 有 id，且 FTE 与之前不同，则 update
 *    4. 有 id，且 FTE === 0，则 delete
 *
 * @param {array} sowPositions 要处理的 sowPosition
 * @param {number} year 年份
 * @param {object} t transaction
 *
 * @returns {null}
 */
async function checkUpdateSowPosition (sowPositions, year, t) {
  let
    nowYear = (new Date()).getFullYear(),
    count,
    isExecution

  if (sowPositions.length === 0) throw new Error('SoW Position 没有数据')
  if (year === nowYear) {
    isExecution = (
      await models.sow.findOne({
        transaction: t,
        where: {id: sowPositions[0].sowId}
      })
    ).isExecution

    if (isExecution === Y) {
      count = await models.sow.count({
        transaction: t,
        where: {
          year,
          isExecution: Y,
          flowStatus: {$notIn: [POCollected, special]}
        }
      })
      if (count !== 0) throw new Error(`当前存在未确认的 ${year} 的 SoW，所以无法进行创建 / 修改`)
    }
  }

  for (let sowPosition of sowPositions) {
    sowPosition.FTE = parseFloat(sowPosition.FTE)

    let $oldSowPosition

    if (sowPosition.id) {
      $oldSowPosition = await models.sowPosition.findOne({
        transaction: t,
        where: {
          id: sowPosition.id
        }
      })
      sowPosition.beforeFTE = $oldSowPosition.FTE
    }

    if (!sowPosition.id) {
      sowPosition.operation = Create
      sowPosition.beforeFTE = 0
    }
    else if (sowPosition.FTE === 0) {
      sowPosition.operation = Delete
    }
    else {
      sowPosition.operation = sowPosition.FTE === $oldSowPosition.FTE ? NoChange : Update
    }

    let $sow = await models.sow.findOne({
      transaction: t,
      where: {
        id: sowPosition.sowId
      }
    })

    if ($sow.year !== year) throw new Error(`Position 与 SoW - ${$sow.name} 年份不一致`)

    if (sowPosition.operation !== NoChange) {

      if ($sow.isExecution === N && ![toSubmit, refusedByClient, refusedByFD, special].includes($sow.flowStatus)) {
        throw new Error(`该 SoW-${$sow.name} 的状态为 ${$sow.flowStatus}，不能进行编辑`)
      }
    }
  }

}
exports.checkUpdateSowPosition = checkUpdateSowPosition
