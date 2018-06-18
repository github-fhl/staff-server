const
  {getList, create} = require('../src/costDistribution'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/costDistributions')
    .get(can('read', 'costDistribution'), getList)
    .post(can('create', 'costDistribution'), create)
}
