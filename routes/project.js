const
  {create, getList, getProjectName, get, flow, copy, update, updateOfficeRate, getProjectBalance} = require('../src/project'),
  {can} = require('../components/rbac'),
  {projectOperation} = require('config').flowCfg

module.exports = router => {

  router.route('/projects')
    .get(can('read', 'project'), getList)
    .post(can('create', 'project'), create)

  router.route('/projectName')
    .get(can('read', 'project'), getProjectName)

  router.route('/projects/:id')
    .get(can('read', 'project'), get)
    .put(can('update', 'project'), update)

  router.route('/getProjectBalance/:id')
    .get(can('read', 'project'), getProjectBalance)

  router.route('/copyProjects/:id')
    .post(can('copy', 'project'), copy)

  router.route('/updateOfficeRate/:id')
    .put(can('read', 'project'), updateOfficeRate)

  Object.values(projectOperation).forEach(handle => {
    router.route(`/${handle}/projects/:id`)
      .put(can(handle, 'project'), flow)
  })
}

