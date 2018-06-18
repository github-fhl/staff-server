const
  {models} = require('../../models/index')

/**
 * 创建 dataLog
 * 1. 检查是否已经存在
 * 2. 如果不存在则创建一条数据
 * @return {Promise.<void>}
 */

async function createDataLog (dataLogType, data, t) {
  await models.dataLog.findOrCreate({
    transaction: t,
    where: {
      dataLogType,
      data
    }
  })
}
exports.createDataLog = createDataLog
