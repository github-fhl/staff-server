const
  {update, getNameHistory} = require('../controller/fordFunction')

module.exports = router => {
  router.route('/v2/fordFunction/:id')
    .put(update)
    .get(getNameHistory)
}
