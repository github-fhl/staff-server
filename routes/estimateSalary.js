const
  {create, calculateEstimateSalary} = require('../src/estimateSalary'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/estimateSalarys')
    .post(can('update', 'recruitFreelancer'), create)

  router.route('/calculateEstimateSalary')
    .get(can('update', 'recruitFreelancer'), calculateEstimateSalary)
}
