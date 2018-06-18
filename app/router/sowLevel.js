const
  {create} = require('../controller/sowLevel')
  // {can} = require('../../components/rbac')

module.exports = router => {
  router.route('/sowLevels')
    .post(create)
}
