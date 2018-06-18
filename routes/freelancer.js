const
  {getList, get, freelancerDismission} = require('../src/freelancer'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/freelancers')
    .get(can('read', 'freelancer'), getList)

  router.route('/freelancers/:id')
    .get(can('read', 'freelancer'), get)

  router.route('/freelancerDismission/:id')
    .put(can('dismiss', 'freelancer'), freelancerDismission)
}
