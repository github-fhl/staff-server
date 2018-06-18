const
  {models} = require('../../models/index'),
  {Regular} = require('config').cfg.staffType

async function insertStaffHistory (staffInfos, t) {
  let staffHistories = []

  for (let staffInfo of staffInfos) {
    let staffHistory = {
      staffId: staffInfo.id,
      staffType: Regular,
      ...staffInfo,
    }

    delete staffHistory.id
    staffHistories.push(staffHistory)
  }
  await models.staffHistory.bulkCreate(staffHistories, {transaction: t})
}

exports.insertStaffHistory = insertStaffHistory
