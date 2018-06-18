const
  {models} = require('../../../models');

module.exports = async t => {
  let $orgNodes = await getOrgNodes(t);
  let maxTier = await models.orgNode.max('tier', {where: {status: 1}, transaction: t});

  return assemblyOrgNodes(maxTier, $orgNodes);
}

async function getOrgNodes (t) {
  let $orgNodes = await models.orgNode.findAll({
    where: {status: 1},
    include: [
      {model: models.staff, attributes: ['name']},
      {model: models.staff, attributes: ['name'], as: 'lastStaff'},
    ],
    order: [['index', 'asc']],
    transaction: t
  });

  $orgNodes.forEach(orgNode => {
    orgNode.dataValues.children = [];
  })

  return $orgNodes;
}

function assemblyOrgNodes (maxTier, $orgNodes) {
  while (maxTier > 0) {
    $orgNodes.forEach(orgNode => {
      if (orgNode.tier === maxTier) {
        $orgNodes.forEach(parentOrgNode => {
          if (parentOrgNode.tier === maxTier - 1 && parentOrgNode.id === orgNode.pId) {
            parentOrgNode.dataValues.children.push(orgNode);
          }
        })
      }
    })
    maxTier -= 1;
  }
  let Array = [];

  for (let orgNode of $orgNodes) {
    if (orgNode.tier === 1) {
      Array.push(orgNode);
    }
  }
  return Array;
}
