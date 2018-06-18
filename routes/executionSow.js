const
  {testGeneratorExecutionSow} = require('../src/executionSow'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/testGeneratorExecutionSow')
    .get(can('test', 'program'), testGeneratorExecutionSow)
}
