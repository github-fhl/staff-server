const
  {ApiDialect} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrDismission, attrFlowLog} = require('../args')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = []

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send({
          dateFormat: ['YYYY-MM-DD', 'applicationDate', 'leaveDate', 'stopPayDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $dismissions = await models.dismission.findAll({
    attributes: attrDismission,
    include: [{
      model: models.positionLog,
      attributes: ['id', 'name']
    }, {
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })

  return $dismissions
}
