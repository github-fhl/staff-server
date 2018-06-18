const
  {editContract} = require('../controller/staff')

module.exports = router => {
  router.route('/staffs/editContract')
    .put(editContract)
}
