const
  {testMigratePositionLog} = require('../src/schedule'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/testMigratePositionLog')
    .get(can('test', 'program'), testMigratePositionLog)
}
