const
  {getList, create, flow, get, update} = require('../src/dismission'),
  {can} = require('../components/rbac'),
  {dismissionOperation} = require('config').flowCfg


module.exports = router => {

  router.route('/dismissions')
    .get(can('read', 'dismission'), getList)
    .post(can('create', 'dismission'), create)

  router.route('/dismissions/:id')
    .put(can('update', 'dismission'), update)
    .get(can('read', 'dismission'), get)

  Object.values(dismissionOperation).forEach(handle => {
    router.route(`/${handle}/dismissions/:id`)
      .put(can(handle, 'dismission'), flow)
  })
}
