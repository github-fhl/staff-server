const
  {getList, staffsAndOrgNodesList, replaceNodes, draft, getLeaders} = require('../controller/orgNode')
// {can} = require('../../components/rbac');

module.exports = router => {
  router.route('/orgNodes')
    .get(getList);

  router.route('/orgNodes/replace')
    .get(staffsAndOrgNodesList)
    .put(replaceNodes);

  router.route('/orgNodes/draft')
    .put(draft)

  router.route('/orgNodesLeaders')
    .get(getLeaders);
}
