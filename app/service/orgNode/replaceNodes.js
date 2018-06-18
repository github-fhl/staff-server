const
  {models} = require('../../../models'),
  remove = require('./remove');

module.exports = async (args, t) => {
  await validateNodes(args, t);
  await replaceNode(args, t);
}


async function validateNodes (args, t) {
  let $orgNode = await models.orgNode.findOne({
    where: {staffId: args.staffId, status: 1},
    attributes: ['id'],
    transaction: t
  });
  let $childNode = await models.orgNode.findOne({
    where: {pId: $orgNode.id},
    transaction: t
  })

  if ($childNode) {
    throw new Error('替换人员不能有下属');
  }
  let $toPlaceNode = await models.orgNode.findOne({
    where: {id: args.nodeId, status: 1},
    transaction: t
  })

  if ($toPlaceNode.staffId) {
    throw new Error('被替换节点不能有员工');
  }
}

async function replaceNode (args, t) {
  await remove(args.staffId, t);
  await models.orgNode.update({staffId: args.staffId}, {where: {id: args.nodeId}, transaction: t});
}
