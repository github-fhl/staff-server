const
  getList = require('./getList')

module.exports = async t => {
  let $orgNodes = await getList(t);
  let staffs = [];
  let orgNodes = [];

  assemblyData(staffs, orgNodes, $orgNodes);

  return {staffs, orgNodes}
}


function assemblyData (staffs, orgNodes, $orgNodes) {
  $orgNodes.forEach(orgNode => {
    if (!orgNode.staffId) {
      orgNodes.push(orgNode)
    }
    if (orgNode.dataValues.children.length === 0) {
      staffs.push(orgNode)
    }
    if (orgNode.dataValues.children.length > 0) {
      return assemblyData(staffs, orgNodes, orgNode.dataValues.children);
    }
  })
}
