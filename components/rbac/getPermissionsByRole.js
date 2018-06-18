const
  {getRBAC} = require('./buildRBACArgs')

function getPermissionsByRole (roleId) {
  let permissions
  let newRBAC = getRBAC()

  newRBAC.getScope(roleId, (err, scopes) => {
    if (err) throw err
    permissions = scopes
  })
  return permissions
}
exports.getPermissionsByRole = getPermissionsByRole
