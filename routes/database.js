const
  {dumpDatabase, getList, importDatabase} = require('../src/database'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/dumpDatabase')
    .get(can('test', 'program'), dumpDatabase)

  router.route('/getDatabaseNames')
    .get(can('test', 'program'), getList)

  router.route('/importDatabase')
    .get(can('test', 'program'), importDatabase)
}
