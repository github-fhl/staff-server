const
  {getList} = require('../src/positionLog'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/positionLogs')
    .get(can('read', 'positionLog'), getList)

}
