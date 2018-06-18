const
  {get} = require('../controller/jobInfo')

module.exports = router => {
  router.route('/jobInfo/:id')
    .get(get)
}
