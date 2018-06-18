const
  {models} = require('../../models')

let getTier = (leaderName, obj, tier) => {
  if (!leaderName) return tier;
  return getTier(obj[leaderName], obj, tier + 1);
}

let getPid = (leaderName, obj) => {
  if (!leaderName) return null;
  return obj[leaderName];
}

let getStaffId = async (staffName, t) => {
  let $staff = await models.staff.findOne({where: {name: staffName}, attributes: ['id'], transaction: t});

  return $staff.id;
}

module.exports = async (workbook, t) => {
  let worksheet = workbook.getWorksheet('Staff');

  if (!worksheet) return
  let fieldIndex = {
      id: 2,
      staffName: 3,
      leader: 4,
      title: 7
    },
    index = 1,
    idObj = {},
    leaderObj = {},
    orgNodes = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      idObj[row.getCell(fieldIndex.staffName).value] = row.getCell(fieldIndex.id).value;
      leaderObj[row.getCell(fieldIndex.staffName).value] = row.getCell(fieldIndex.leader).value;
      orgNodes.push({
        index,
        title: row.getCell(fieldIndex.title).value,
        status: 1,
        staffName: row.getCell(fieldIndex.staffName).value,
        leaderName: row.getCell(fieldIndex.leader).value
      });
      index += 1;
    }
  })

  for (let orgNode of orgNodes) {
    orgNode.tier = getTier(orgNode.leaderName, leaderObj, 1);
    orgNode.pId = getPid(orgNode.leaderName, idObj);
    orgNode.staffId = await getStaffId(orgNode.staffName, t);
  }

  await models.orgNode.bulkCreate(orgNodes, {transaction: t});
}
