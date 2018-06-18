const
  {editContract} = require('../controller/freelancer')

module.exports = router => {
  router.route('/freelancers/editContract')
    .put(editContract)
}
