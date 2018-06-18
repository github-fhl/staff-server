const
  PONote = require('../src/sow/PO_Note'),
  {can} = require('../components/rbac')

module.exports = router => {
  router.route('/clientPos')
    .get(can('read', 'clientPo'), PONote.clientPoGetList)

  router.route('/clientPos')
    .put(can('update', 'clientPo'), PONote.clientPoUpdate)
}
