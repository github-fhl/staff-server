const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {projectStatus, productionStatus} = require('config').get('flowCfg')

module.exports = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', true)
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
  let result = {}

  result.positions = (await models.position.findAll({
    where: {year: args.year},
    attributes: ['id', 'name'],
    include: [{
      model: models.positionLog,
      separate: true,
      limit: 1,
      order: [['seqNo', 'DESC']],
      attributes: ['id', 'positionId', 'staffId', 'seqNo'],
      include: [{
        model: models.staff,
        attributes: ['name', 'id']
      }]
    }]
  })).map(position => ({
    id: position.id,
    name: position.name,
    staffName: position.positionLogs[0].staff ?
      position.positionLogs[0].staff.name :
      null
  }))
  result.projects = await models.project.findAll({
    where: {
      flowStatus: projectStatus.POCollected
    },
    attributes: ['id', 'name']
  })
  result.productions = await models.production.findAll({
    where: {
      flowStatus: productionStatus.Running
    },
    attributes: ['id', 'description']
  })
  result.inhouseFreelancers = await models.inhouseFreelancer.findAll({
    where: {
      year: args.year
    },
    attributes: ['id']
  })

  return result
}
