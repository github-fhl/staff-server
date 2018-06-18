const
  {ApiDialect} = require('api-dialect'),
  {sequelize} = require('../../models/index'),
  moment = require('moment'),
  {generatorSystemArgsRun} = require('./generatorSystemArgs'),
  {generatorExecutionSowRun} = require('./generatorExecutionSow'),
  {migratePositionLogRun} = require('./migratePositionLog')

/**
 * 测试转移 positionLog
 * 1. 先生成 2019 年的 systemArgs
 * 2. 生成执行版本的 sow
 * 3. 迁移 positionLog
 */

function testMigratePositionLog (req, res) {
  let api = new ApiDialect(req, res)

  sequelize.transaction(t => run(t))
    .then(objs => {
      api
        .setResponse(objs)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'leaveDate', 'transferDate']
        })
    })
    .catch(err => api.error(err))
}
exports.testMigratePositionLog = testMigratePositionLog

async function run (t) {
  let year = moment().year() + 1

  await generatorSystemArgsRun(year, t)
  await generatorExecutionSowRun(year, t)
  await migratePositionLogRun(year, t)
}
