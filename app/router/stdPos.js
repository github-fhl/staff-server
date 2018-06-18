const
  {importStdPos} = require('../controller/stdPos')

module.exports = router => {
  router.route('/stdPos/import')
    .put(importStdPos)
}
