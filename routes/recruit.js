const
  {getList, get, create, update, flow} = require('../src/recruit'),
  {can} = require('../components/rbac'),
  {recruitOperation} = require('config').flowCfg


module.exports = router => {

  router.route('/recruits')
    .get(can('read', 'recruit'), getList)
    .post(can('create', 'recruit'), create)

  router.route('/recruits/:id')
    .put(can('update', 'recruit'), update)
    .get(can('read', 'recruit'), get)

  Object.values(recruitOperation).forEach(handle => {
    router.route(`/${handle}/recruits/:id`)
      .put(can(handle, 'recruit'), flow)
  })
}
