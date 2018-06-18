const
  {models} = require('../../models/index'),
  {initAccounts} = require('config').get('init'),
  {financeManager, financeDirector, hr, developer, admin} = initAccounts

let accounts = [],
  roles = [],
  accountRoles = []

Object.keys(initAccounts).forEach(account => {
  accounts.push({id: account, name: account, password: 123})
  roles.push({id: account, name: account})
  accountRoles.push({accountId: account, roleId: account})
})

let initAccount = async t => {
  // 创建账号
  await models.account.bulkCreate(accounts, {transaction: t})

  // 创建角色
  await models.role.bulkCreate(roles, {transaction: t})

  // 创建账号角色关联
  await models.accountRole.bulkCreate(accountRoles, {transaction: t})

  let {permissions, grants} = require('../../Permissions/service-permission')

  grants = [
    ...grants,
    {seniorRole: developer, juniorRole: financeManager},
    {seniorRole: developer, juniorRole: hr},
    {seniorRole: developer, juniorRole: admin},
    {seniorRole: developer, juniorRole: financeDirector},
  ]

  // 创建 permission

  await models.permission.bulkCreate(permissions, {transaction: t})

  // 创建 grant
  await models.grant.bulkCreate(grants, {transaction: t})

  console.log('账号初始化完成！')
}

exports.initAccount = initAccount
