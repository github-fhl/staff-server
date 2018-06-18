const
  {ApiDialect} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrExtension, attrFlowLog, JSONkeyExtensionArr} = require('../args'),
  {parseJSON} = require('../commonFn')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'leaveDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $extensions = await models.extension.findAll({
    attributes: attrExtension,
    include: [{
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })

  for (let $extension of $extensions) {
    parseJSON($extension.dataValues, JSONkeyExtensionArr)
  }

  return $extensions
}
