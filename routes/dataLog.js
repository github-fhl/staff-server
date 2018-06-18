const
  {getList, create} = require('../src/dataLog'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/dataLogs')
    .get(can('read', 'commonInfo'), getList)
}
