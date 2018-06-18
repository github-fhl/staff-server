const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {Y} = require('config').get('args'),
  {attrExtension, attrFlowLog, JSONkeyExtensionArr} = require('../args'),
  parseJSON = require('../commonFn/parseJSON')

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
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
  let $extension = await models.extension.findById(args.id, {
    attributes: attrExtension,
    include: [{
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }, {
      model: models.staff,
      attributes: ['id'],
      include: [{
        model: models.staffHistory,
        attributes: ['entryDate', 'leaveDate'],
        where: {
          validFlag: Y
        }
      }]
    }]
  })

  if (!$extension) throw new Error(`${args.id} 申请单不存在`)
  parseJSON($extension.dataValues, JSONkeyExtensionArr)
  return $extension
}
