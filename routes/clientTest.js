const
  {clientTest} = require('../clientTest'),
  {can} = require('../components/rbac'),
  {upload} = require('../src/upload')

module.exports = router => {

  router.route('/clientTest')
    .put(upload.single('file'), clientTest)
}
