const
  {edit, get} = require('../controller/passThrough')

module.exports = router => {
  router.route('/passThrough')
    .put(edit)
    .get(get)
}
