const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {checkOperationProjectDetail} = require('./checkOperationProjectDetail'),
  {createProjectDetail} = require('./create'),
  {deleteProjectDetail} = require('./destroy')

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = Arg.factory(models.projectDetail, 'put')

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  await checkOperationProjectDetail(args.projectId, t)
  await deleteProjectDetail(args.id, t)
  await createProjectDetail(args, t)
}
