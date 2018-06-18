const
  {create, destroy, update} = require('../src/projectDetail'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/projectDetails')
    .post(can('create', 'project'), create)

  router.route('/projectDetails/:id')
    .delete(can('create', 'project'), destroy)
    .put(can('update', 'project'), update)
}

