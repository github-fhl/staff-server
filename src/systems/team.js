const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index')

const
  attrMainCfg = ['id', 'name', 'brief']

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)

  getTeams(api)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 *
 * @param {object} api 参数
 * @returns {Promise.<{rows: *, count}>}
 */
async function getTeams (api) {
  let $teams = await models.team.findAll({
    attributes: attrMainCfg,
    order: 'id ASC'
  })

  return {rows: $teams, count: $teams.length}
}
exports.getTeams = getTeams

exports.new = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [...Arg.factory(models.team),
    new Arg('clientId', true),
    new Arg('id', false)
  ]

  if (!api.setArgs(args)) return

  let run = async t => {
    checkBriefNoBlank(api.args.brief)

    let [$team, createdTeam] = await models.team.findOrCreate({
      where: {id: api.args.id},
      defaults: api.args,
      transaction: t
    })

    $team.dataValues.createdTeam = createdTeam
    if ($team.brief !== api.args.brief) {
      await $team.update({brief: api.args.brief}, {transaction: t})
      $team.dataValues.updatedTeam = true
    }


    let ClientTeam = {
      clientId: api.args.clientId,
      teamId: $team.id
    }

    await models.ClientTeam.findOrCreate({
      where: ClientTeam,
      defaults: ClientTeam,
      transaction: t
    })

    return $team
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.team, 'put')

  if (!api.setArgs(args)) return

  let run = async t => {
    checkBriefNoBlank(api.args.brief)

    let $team = await models.team.findOne({
      where: {id: api.args.id},
      attributes: attrMainCfg,
      transaction: t
    })

    if (!$team) throw new Error(`${api.args.id} 不存在`)

    if (api.args.updatedId) api.args.id = api.args.updatedId
    await models.team.update(api.args, {
      where: {id: $team.id},
      transaction: t
    })

    $team = await models.team.findOne({
      where: {id: api.args.id},
      transaction: t,
      attributes: attrMainCfg,
    })

    return $team
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

function checkBriefNoBlank (brief) {
  if (brief.includes(' ')) throw new Error(`${brief} 不能存在空格`)
}
