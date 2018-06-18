const
  models = require('../../models').models,
  {getPermissionsByRole} = require('./getPermissionsByRole')

async function getPermissionsByAccount (accountId, t) {
  let permissions = []
  let $accountRoles = await models.accountRole.findAll({
    where: {
      accountId,
      status: 1
    },
    transaction: t
  })

  $accountRoles.map($accountRole => $accountRole.roleId).forEach(roleId => {
    permissions = [...permissions, ...getPermissionsByRole(roleId)]
  })
  return permissions
}

exports.getPermissionsByAccount = getPermissionsByAccount
