const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {clientType} = require('config').args,
  NP = require('number-precision')

const
  attrPosition = ['id', 'name', 'expectStaffId', 'companyId', 'titleId', 'sowLevel', 'teamId', 'fordFunctionId', 'FTE']

const getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('year', true),
    new Arg('clientId', false)
  ]

  if (!api.setArgs(receiveArgs)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let where = {year: args.year}

  if (args.clientId) {
    let $ClientTeams = await models.ClientTeam.findAll({
      where: {
        clientId: args.clientId,
        status: 1
      }
    })

    let teamIds = $ClientTeams.map($ClientTeam => $ClientTeam.teamId)

    where.teamId = {
      $in: teamIds
    }
  }

  let letGoId = (await models.sow.findOne({
    where: {
      year: args.year,
      sowType: clientType.LetGo
    }
  })).id
  let $positions = await models.position.findAll({
    where,
    attributes: attrPosition,
    include: [{
      model: models.sowPosition,
      required: false,
      where: {status: 1},
      include: [{
        model: models.sow,
        where: {
          sowType: {$ne: clientType.InHouse}
        }
      }]
    }, {
      model: models.staff,
      attributes: ['name']
    }]
  })

  return $positions.filter($position => {
    let result = true
    let usedFTE = 0

    $position.sowPositions.forEach(sowPosition => {
      if (sowPosition.sowId === letGoId) result = false
      usedFTE = NP.plus(usedFTE, sowPosition.FTE)
    })
    delete $position.dataValues.sowPositions

    $position.dataValues.usedFTE = usedFTE
    return result
  })
}

exports.getList = getList
