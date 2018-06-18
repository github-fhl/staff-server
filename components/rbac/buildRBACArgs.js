const RBAC = require('rbac').default,
  models = require('../../models').models,
  cfg = require('config').get('args'),
  _ = require('lodash')

let newRBAC

exports.buildRBACArgs = async t => {
  let roles = [],
    permissions = {},
    grants = {}

  let $roles = await models.role.findAll({
    where: {status: cfg.status.normal},
    transaction: t
  })

  if ($roles.length === 0) console.error('Please Init the Data，Then Restart Backend Node!')

  let $permissions = await models.permission.findAll({
    where: {status: cfg.status.normal},
    transaction: t
  })
  let $grants = await models.grant.findAll({
    where: {status: cfg.status.normal},
    transaction: t
  })

  roles = $roles.map($role => $role.id)

  $permissions.forEach($p => {
    if (!_.has(permissions, $p.object)) {
      permissions[$p.object] = [$p.operation]
    }
    if (_.has(permissions, $p.object) && !permissions[$p.object].includes($p.operation)) {
      permissions[$p.object].push($p.operation)
    }
  })

  $grants.forEach($grant => {
    if (!_.has(grants, $grant.seniorRole)) {
      grants[$grant.seniorRole] = []
    }
    if ($grant.juniorRole && !grants[$grant.seniorRole].includes($grant.juniorRole)) {
      grants[$grant.seniorRole].push($grant.juniorRole)
    }
    if ($grant.permissionId && !grants[$grant.seniorRole].includes($grant.permissionId)) {
      grants[$grant.seniorRole].push($grant.permissionId)
    }
  })

  let args = {roles, permissions, grants}

  return new RBAC(args, (err, rbac) => {
    if (err) {
      throw new Error(err)
    }
    newRBAC = rbac
  })
}

exports.getRBAC = () => newRBAC
