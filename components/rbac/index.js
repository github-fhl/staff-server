const
  {buildRBACArgs, getRBAC} = require('./buildRBACArgs'),
  {getPermissionsByAccount} = require('./getPermissionsByAccount'),
  {getPermissionsByRole} = require('./getPermissionsByRole'),
  {can} = require('./can')

module.exports = {
  buildRBACArgs,
  getRBAC,
  can,
  getPermissionsByAccount,
  getPermissionsByRole
}
