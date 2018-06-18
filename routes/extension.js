const
  {create, get, getList, update, flow} = require('../src/extension'),
  {can} = require('../components/rbac'),
  {extensionOperation} = require('config').flowCfg


module.exports = router => {

  router.route('/extensions')
    .get(can('read', 'extension'), getList)
    .post(can('create', 'extension'), create)

  router.route('/extensions/:id')
    .get(can('read', 'extension'), get)
    .put(can('update', 'extension'), update)

  Object.values(extensionOperation).forEach(handle => {
    router.route(`/${handle}/extensions/:id`)
      .put(can(handle, 'extension'), flow)
  })
}
