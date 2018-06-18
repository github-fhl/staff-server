const
  {servicePath, modelPath} = require('config'),
  {sequelize, models} = require(modelPath),
  schedule = require('node-schedule'),
  {create} = require(servicePath).sowLevel,
  moment = require('moment'),
  {generatorSowLevelRule} = require('./rules')

/**
 * 自动生成 sowLevel
 * 1. 检查当年是否存在 sowLevel，如果存在，则不自动生成
 * 2. 创建 sowLevel
 */

exports.generatorSowLevel = schedule.scheduleJob(generatorSowLevelRule, () => {
  sequelize.transaction(async t => {
    let nowYear = moment().year()
    let count = await models.sowLevel.count({
      year: nowYear
    })

    if (count !== 0) return

    await create({year: nowYear}, t)
  })
})
