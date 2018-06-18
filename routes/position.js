const
  position = require('../src/position'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/positions')
    .get(can('read', 'position'), position.getList)
    .post(can('create', 'position'), position.create)

  router.route('/positions/:id')
    .get(can('read', 'position'), position.get)

  router.route('/positionName')
    .get(can('read', 'position'), position.getPositionName)

  router.route('/HCCategory')
    .get(can('read', 'position'), position.getHCCategory)

  router.route('/positionBudget')
    .get(can('read', 'position'), position.getBudget)

  router.route('/sowLevel')
    .get(can('read', 'position'), position.getSowLevel)

  router.route('/positionRemark/:id')
    .put(can('read', 'position'), position.updateRemark)
}
