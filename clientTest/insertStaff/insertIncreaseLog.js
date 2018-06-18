const
  {models} = require('../../models/index')


async function insertIncreaseLog (staffInfos, t) {
  let increaseLogs = []

  for (let staffInfo of staffInfos) {
    let increaseLog = {
      staffId: staffInfo.id,
      increaseMonth: staffInfo.nextIncreaseMonth,
      increaseRate: staffInfo.increaseRate
    }

    increaseLogs.push(increaseLog)
  }
  await models.increaseLog.bulkCreate(increaseLogs, {transaction: t})
}

exports.insertIncreaseLog = insertIncreaseLog
