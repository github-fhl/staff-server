const
  {getList} = require('../src/basicInfo'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/basicInfos')
    .get(can('read', 'basicInfo'), getList)
}
