const
  {getList, create, get, update, flow} = require('../src/transfer'),
  {can} = require('../components/rbac'),
  {transferOperation} = require('config').flowCfg


module.exports = router => {

  router.route('/transfers')
    .get(can('read', 'transfer'), getList)
    .post(can('create', 'transfer'), create)

  router.route('/transfers/:id')
    .put(can('update', 'transfer'), update)
    .get(can('read', 'transfer'), get)

  Object.values(transferOperation).forEach(handle => {
    router.route(`/${handle}/transfers/:id`)
      .put(can(handle, 'transfer'), flow)
  })
}
