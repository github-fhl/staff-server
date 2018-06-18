const
  {getList, get, create, update, getProductionName, complete, getProductionBalance} = require('../src/production'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/productions')
    .get(can('read', 'production'), getList)
    .post(can('create', 'production'), create)

  router.route('/productionName')
    .get(can('read', 'production'), getProductionName)

  router.route('/productions/:id')
    .get(can('read', 'production'), get)
    .put(can('update', 'production'), update)

  router.route('/getProductionBalance/:id')
    .get(can('read', 'production'), getProductionBalance)

  router.route('/complete/productions/:id')
    .put(can('complete', 'production'), complete)
}
