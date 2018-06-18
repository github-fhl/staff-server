const
  {getList, create} = require('../src/increaseLog'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/increaseLogs')
    .get(can('read', 'increaseLog'), getList)
    .post(can('create', 'increaseLog'), create)

}
