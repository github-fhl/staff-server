const
  {modelPath} = require('config'),
  {models} = require(modelPath),
  NP = require('number-precision')

/**
 * 更新 sow 的 level 数值
 * 1. sow level 值置为 0
 * 2. 根据 sowPosition 重算 sow 的 level 值
 *
 * @param year sow 的年份
 */

async function updateLevel (year, t) {
  let $sows = await models.sow.findAll({
    where: {year},
    transaction: t
  })

  for (let $sow of $sows) {
    await updateSingleSow($sow, t)
  }
}
module.exports = updateLevel

/**
 * 更新单个 sow
 * 1. 获取 sow 所有的 sowPosition
 */

async function updateSingleSow ($sow, t) {
  let $sowPositions = await models.sowPosition.findAll({
    where: {sowId: $sow.id},
    transaction: t,
    include: [{
      model: models.position
    }]
  })

  let fields = ['level1', 'level2', 'level3', 'level4', 'level5']

  fields.forEach(key => $sow[key] = 0)

  $sowPositions.forEach($sowPosition => {
    $sow[$sowPosition.position.sowLevel] = NP.plus(
      $sow[$sowPosition.position.sowLevel],
      $sowPosition.FTE
    )
  })

  await $sow.save({transaction: t})
}
