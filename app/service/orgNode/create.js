const
  {models} = require('../../../models')

module.exports = async (staffInfo, basicInfo, t) => {
  let leaderInfo = await getLeaderInfo(basicInfo, t);

  await create(staffInfo, leaderInfo, t);
}


async function getLeaderInfo (basicInfo, t) {
  if (!basicInfo.leaderId) {
    return {pId: null, tier: 1};
  }
  let $orgNode = await models.orgNode.findOne({
    where: {staffId: basicInfo.leaderId},
    attributes: ['id', 'tier'],
    transaction: t
  });

  if (!$orgNode) {
    throw new Error('leader不存在');
  }
  return {pId: $orgNode.id, tier: $orgNode.tier + 1};
}

async function create (staffInfo, leaderInfo, t) {
  let maxIndex = await models.orgNode.max('index', {transaction: t});

  await models.orgNode.create({
    title: staffInfo.titleId,
    status: 1,
    staffId: staffInfo.id,
    index: maxIndex + 1,
    ...leaderInfo
  }, {transaction: t});
}
