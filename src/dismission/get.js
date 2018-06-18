const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrDismission, attrFlowLog} = require('../args')

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
          dateFormat: ['YYYY-MM-DD', 'applicationDate', 'leaveDate', 'stopPayDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $dismission = await models.dismission.findById(args.id, {
    attributes: attrDismission,
    include: [{
      model: models.positionLog,
      attributes: ['name']
    }, {
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }, {
      model: models.staff,
      include: [{
        model: models.staffHistory,
        separate: true,
        order: [['entryDate', 'DESC']],
        limit: 1
      }]
    }]
  })

  if (!$dismission) throw new Error(`${args.id} 申请单不存在`)

  $dismission.dataValues.noticePeriod = $dismission.staff.staffHistories[0].noticePeriod
  delete $dismission.dataValues.staff
  return $dismission
}
