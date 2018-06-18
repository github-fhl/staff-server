const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrRecruit, JSONkeyRecruitArr, attrFlowLog} = require('../args'),
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
  let $recruit = await models.recruit.findById(args.id, {
    attributes: attrRecruit,
    include: [{
      model: models.positionLog,
      attributes: ['id', 'name', 'location']
    }, {
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })

  if (!$recruit) throw new Error(`${args.id} 数据不存在`)
  parseJSON($recruit.dataValues, JSONkeyRecruitArr)
  return $recruit
}
