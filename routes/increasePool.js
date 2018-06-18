const
  {getList, create} = require('../src/increasePool'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/increasePools')
    .get(can('read', 'increaseLog'), getList)
    .post(can('create', 'increasePool'), create)

}
