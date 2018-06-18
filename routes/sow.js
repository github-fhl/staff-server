const
  {getList, create, get, copy, updatePassThrough, getNewSowInfo, flow, getSow, startSow} = require('../src/sow'),
  {can} = require('../components/rbac'),
  {
    submit, fdRefuse, fdApprove, clientRefuse, clientApprove, collectPO
  } = require('config').flowCfg.sowOperation

module.exports = router => {

  router.route('/sows')
    .get(can('read', 'sow'), getList)
    .post(can('create', 'sow'), create)

  router.route('/sows/:id')
    .get(can('read', 'sow'), get)

  router.route('/getSow')
    .get(can('read', 'sow'), getSow)

  router.route('/duplicateSow')
    .post(can('copy', 'sow'), copy)

  router.route('/sowPassThroughs/:id')
    .put(can('update', 'passThrough'), updatePassThrough)

  router.route('/newSowInfo')
    .get(can('read', 'sow'), getNewSowInfo)

  router.route('/startSow')
    .put(can('start', 'sow'), startSow)

  // 审批流
  let handles = [submit, fdRefuse, fdApprove, clientRefuse, clientApprove, collectPO]

  handles.forEach(handle => {
    router.route(`/${handle}/sow/:id`)
      .put(can(handle, 'sow'), flow)
  })
}
