const
  {updateTime} = require('../src/testFn'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/updateTime')
    .get(can('test', 'program'), updateTime)

}

