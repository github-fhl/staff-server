const
  {create, flow} = require('../src/recruitFreelancer'),
  {can} = require('../components/rbac'),
  {submit, approve, refuse, onboard, abandon} = require('config').flowCfg.recruitOperation


module.exports = router => {

  router.route('/recruitFreelancers')
    .post(can('create', 'recruitFreelancer'), create)

  let operations = [submit, approve, refuse, onboard, abandon]

  operations.forEach(handle => {
    router.route(`/${handle}/recruitFreelancers/:id`)
      .put(can(handle, 'recruitFreelancer'), flow)
  })
}
