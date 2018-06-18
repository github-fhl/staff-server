const
  {models} = require('../../../models'),
  getList = require('./getList')

/**
 * 组织架构拖拽
 * 第一步：获取目标节点与当前节点的信息
 * 第二步：更新组织架构的index
 * 第三步：跟新组织架构的tier以及父节点
 * @param args
 * @param t
 * @returns {Promise<*>}
 */

module.exports = async (args, t) => {
  let $targetOrgNode = await models.orgNode.findOne({where: {id: args.targetPosition}, transaction: t});
  let $previousOrgNode = await models.orgNode.findOne({where: {id: args.previousPosition}, transaction: t});

  await updateIndex($targetOrgNode, $previousOrgNode, args.dropType, t);
  await updateOrgNode($targetOrgNode, $previousOrgNode, args.dropType, t)
  let $orgNodes = await getList(t);

  return $orgNodes;
}

async function updateIndex ($targetOrgNode, $previousOrgNode, dropType, t) {
  let where = {};
  let newIndex;

  switch (dropType) {
    case -1:
      where.tier = $targetOrgNode.tier;
      where.index = {$gte: $targetOrgNode.index};
      newIndex = $targetOrgNode.index;
      break;
    case 0:
      where.tier = $targetOrgNode.tier + 1;
      where.index = {$gt: $targetOrgNode.index};
      newIndex = $targetOrgNode.index + 1;
      break;
    case 1:
      where.tier = $targetOrgNode.tier;
      where.index = {$gt: $targetOrgNode.index};
      newIndex = $targetOrgNode.index + 1;
      break;
    default:
      break;
  }
  let $toUpdateIndexOrgNodes = await models.orgNode.findAll({
    where,
    transaction: t
  })

  for (let $toUpdateIndexOrgNode of $toUpdateIndexOrgNodes) {
    await $toUpdateIndexOrgNode.update({index: $toUpdateIndexOrgNode.index + 1}, {transaction: t})
  }
  await $previousOrgNode.update({index: newIndex}, {transaction: t})
}

async function updateOrgNode ($targetOrgNode, $previousOrgNode, dropType, t) {
  let tier, pId;

  if (dropType === 0) {
    tier = $targetOrgNode.tier + 1;
    pId = $targetOrgNode.id;
  } else {
    tier = $targetOrgNode.tier;
    pId = $targetOrgNode.pId;
  }
  await $previousOrgNode.update({tier, pId}, {transaction: t});
  let $childNodes = await models.orgNode.findAll({});

  await updateChildNodes($previousOrgNode, $childNodes, t);
}

async function updateChildNodes ($previousOrgNode, $childNodes, t) {
  for (let $childNode of $childNodes) {
    if ($childNode.pId === $previousOrgNode.id) {
      await $childNode.update({tier: $previousOrgNode.tier + 1}, {transaction: t});
      await updateChildNodes($childNode, $childNodes, t);
    }
  }
}
