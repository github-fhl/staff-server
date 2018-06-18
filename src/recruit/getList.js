const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrRecruit, JSONkeyRecruitArr, attrFlowLog} = require('../args'),
  {parseJSON} = require('../commonFn')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('recruitType', true)
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
  let $recruits = await models.recruit.findAll({
    where: {
      recruitType: args.recruitType
    },
    attributes: attrRecruit,
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

  for (let $recruit of $recruits) {
    parseJSON($recruit.dataValues, JSONkeyRecruitArr)
  }

  return $recruits
}
