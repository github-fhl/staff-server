const
  {upload, uploadFile} = require('../src/upload'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/uploadFile')
    .post(can('upload', 'file'), upload.single('file'), uploadFile)
}
