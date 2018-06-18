const
  {sequelize} = require('../../models/index'),
  schedule = require('node-schedule'),
  moment = require('moment'),
  {generatorExecutionSowRule} = require('./rules'),
  {generator} = require('../executionSow')

exports.generatorExecutionSow = schedule.scheduleJob(generatorExecutionSowRule, () => {
  let nowYear = moment().year()

  sequelize.transaction(t => generator(nowYear, t))
})

async function generatorExecutionSowRun (year, t) {
  await generator(year, t)
}
exports.generatorExecutionSowRun = generatorExecutionSowRun
