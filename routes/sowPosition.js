const
  sowPosition = require('../src/sowPosition'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/sowPositions')
    .post(can('create', 'sowPosition'), sowPosition.create)

  router.route('/clientCost')
    .get(can('read', 'position'), sowPosition.getClientCost)

  router.route('/getData/sowPositions')
    .get(can('read', 'position'), sowPosition.getData)
}
