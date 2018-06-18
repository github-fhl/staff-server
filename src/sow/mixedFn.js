/**
 * 在本文件中都是非纯函数，读取 IO 操作后，调用纯函数
 * 命名不可与纯函数重复
 */

const
  {models} = require('../../models/index'),
  config = require('config'),
  {sowStatus} = config.flowCfg,
  {N} = config.args,
  NP = require('number-precision')

/**
 * 创建 sow 时，需要检查 —— 名字不可重复
 * @param {string} name sow 名称
 * @param {object} t transaction
 * @return {null}
 */
const checkSowNameUnique = async (name, t) => {
  let count = await models.sow.count({
    where: {name},
    transaction: t
  })

  if (count !== 0) throw new Error(`${name} 已存在`)
}

exports.checkSowNameUnique = checkSowNameUnique


/**
 * 复制 sow 后，将之前的 sow 版本全部 disable，并将 status 改为 0
 * 将 sowPosition 的 status 改为 0
 *
 * @param {string} newSowId sow 的 id
 * @param {object} t transaction
 * @return {null}
 */
const disableHistorySow = async (newSowId, t) => {
  let $sow = await models.sow.findOne({
    where: {id: newSowId},
    transaction: t
  })
  let $historySows = await models.sow.findAll({
    where: {
      name: $sow.name,
      year: $sow.year,
      version: {$ne: $sow.version}
    },
    transaction: t
  })
  let historyIds = $historySows.map($historySow => $historySow.id)

  await models.sow.update({
    flowStatus: sowStatus.disabled,
    status: 0
  }, {
    where: {id: {$in: historyIds}},
    transaction: t
  })
  await models.sowPosition.update({
    status: 0
  }, {
    where: {sowId: {$in: historyIds}},
    transaction: t
  })
}

exports.disableHistorySow = disableHistorySow


/**
 * 复制 sow 后，检查复制后的 position 的 FTE 的总和是否 <= 1
 *
 * @param {string} sowId sow 的 id
 * @param {object} t transaction
 * @return {null}
 */
const checkPositionFTENoMore1 = async (sowId, t) => {
  let $getPositionIds = await models.sowPosition.findAll({
    where: {
      sowId,
      status: 1
    },
    transaction: t
  })
  let positionIds = $getPositionIds.map($item => $item.positionId)
  let $sowPositions = await models.sowPosition.findAll({
    where: {
      positionId: {$in: positionIds},
      status: 1
    },
    transaction: t,
    include: [{
      model: models.position
    }]
  })
  let positions = {}

  $sowPositions.forEach($sowPosition => {
    if (!positions[$sowPosition.positionId]) positions[$sowPosition.positionId] = 0
    positions[$sowPosition.positionId] = NP.plus(positions[$sowPosition.positionId], $sowPosition.FTE)
    if (positions[$sowPosition.positionId] > 1) throw new Error(`${$sowPosition.position.name} 的 FTE 超过 1，${positions[$sowPosition.positionId]} `)
  })
}

exports.checkPositionFTENoMore1 = checkPositionFTENoMore1


/**
 * 获取新 sow 的版本号
 *
 * @param {string} name 名字
 * @param {number} year 年份
 * @param {object} t transaction
 * @returns {string}
 */
const getNewSowVersion = async (name, year, t) => {
  let maxVersion = await models.sow.max('version', {
    where: {
      name,
      year,
      isExecution: N
    },
    transaction: t
  })

  return (parseInt(maxVersion) + 1).prefix0(3)
}

exports.getNewSowVersion = getNewSowVersion
