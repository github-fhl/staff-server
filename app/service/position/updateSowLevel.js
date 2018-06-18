const
  {modelPath, srcPath} = require('config'),
  {models} = require(modelPath),
  {querySowLevel} = require(srcPath).position

/**
 * 更新 position 的 sowLevel 值
 * 1. 查看年份对应的所有 position
 * 2. 更新其 sowLevel 值
 *
 * @param year sow 的年份
 */

async function updateSowLevel (year, t) {
  let $positions = await models.position.findAll({
    where: {year},
    transaction: t
  })

  for (let $position of $positions) {
    $position.sowLevel = await querySowLevel($position.directComp, $position.currencyId, year - 1, t)
    await $position.save({transaction: t})
  }
}
module.exports = updateSowLevel
