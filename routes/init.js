const
  init = require('../src/init'),
  {can} = require('../components/rbac')

module.exports = router => {

  // 初始化
  router.route('/init/default')
    .get(init.default)

  // 获取所有参数
  router.route('/allArgs')
    .get(can('read', 'commonInfo'), init.getAllArgs)

  // 获取所有系统设置
  router.route('/allSettings')
    .get(can('read', 'commonInfo'), init.getAllSettings)
}
