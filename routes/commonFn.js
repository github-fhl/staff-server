const
  {getJobTypes} = require('../src/commonFn'),
  {can} = require('../components/rbac')

module.exports = router => {

  // 获取所有工作类别
  router.route('/jobTypes')
    .get(can('read', 'commonInfo'), getJobTypes)
}
