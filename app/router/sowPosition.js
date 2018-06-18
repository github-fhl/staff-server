const
  {getNoteContents} = require('../controller/sowPosition')

module.exports = router => {
  router.route('/sowposition/noteContents')
    .get(getNoteContents)
}
