const
  {models} = require('../../../models'),
  moment = require('moment')

module.exports = async (staffId, t) => {
  let $orgNode = await getOrgNode(staffId, t)
  let flag = await whetherLastNode($orgNode, t);

  await remove($orgNode, flag, t);
}

async function remove ($orgNode, flag, t) {
  const nodeHistoryKey = moment().format('YYYY-MM-DD hh:mm:ss');

  if (!$orgNode.nodeHistory) {
    $orgNode.nodeHistory = {}
  }
  $orgNode.nodeHistory[nodeHistoryKey] = {
    staffId: $orgNode.staffId,
    entryDate: $orgNode.staff.staffHistories[0].entryDate,
    leaveDate: $orgNode.staff.staffHistories[0].leaveDate,
    title: $orgNode.title,
    pId: $orgNode.pId
  }
  let removeObj = {
    staffId: null,
    nodeHistory: $orgNode.nodeHistory,
    lastStaffId: $orgNode.staffId
  };

  if (flag) removeObj.status = 0
  await models.orgNode.update(removeObj, {where: {staffId: $orgNode.staffId}, transaction: t});
}

async function getOrgNode (staffId, t) {
  let $orgNode = await models.orgNode.findOne({
    where: {staffId},
    include: [{
      model: models.staff,
      include: [{
        model: models.staffHistory,
        attributes: ['entryDate', 'leaveDate'],
        order: [['createdAt', 'desc']]
      }]
    }],
    transaction: t
  });

  if (!$orgNode) {
    throw new Error('获取组织架构失败')
  }
  return $orgNode
}

async function whetherLastNode ($orgNode, t) {
  let childNode = await models.orgNode.findOne({where: {pId: $orgNode.id, status: 1}, transaction: t});

  if (childNode) return false;
  return true;
}

