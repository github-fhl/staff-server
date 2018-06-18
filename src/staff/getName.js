const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  cfg = require('config').get('args'),
  {Onboarded, Left} = require('config').get('flowCfg').staffStatus,
  {recruit, recruitFreelancer, transfer, dismission, extension} = cfg.formType,
  {Regular, Freelancer} = cfg.staffType

exports.getName = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('formType', false),
    new Arg('staffType', false),
    new Arg('clientId', false),
    new Arg('name', false)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send({})
    })
    .catch(err => api.error(err))
}

/**
 * 获取员工
 * 1. recruit: 招聘正式员工
 *      1. 已离职的正式员工
 *      2. Freelancer
 * 2. recruitFreelancer：招聘临时员工
 *      1. 在职的正式员工
 *      2. 离职的正式员工
 *      3. 已离职的Freelancer
 * 3. transfer：转岗
 *      1. 在职的正式员工
 * 4. dismission：离职
 *      1. 在职的正式员工
 * 5. extension：延期
 *      1. 在职的 Freelancer
 *
 *
 * sow 查看 benchmark 时，只能查看 client 对应 team 的员工
 */

async function run (args) {
  let where = {}

  if (args.formType) {
    switch (args.formType) {
      case recruit:
        where = {
          $or: [{
            staffType: Regular,
            flowStatus: Left
          }, {
            staffType: Freelancer
          }]
        }
        break
      case recruitFreelancer:
        where = {
          $or: [{
            staffType: Regular,
            flowStatus: {$in: [Onboarded, Left]}
          }, {
            staffType: Freelancer,
            flowStatus: Left
          }]
        }
        break
      case transfer:
        where = {
          staffType: Regular,
          flowStatus: Onboarded
        }
        break
      case dismission:
        where = {
          staffType: Regular,
          flowStatus: Onboarded
        }
        break
      case extension:
        where = {
          staffType: Freelancer,
          flowStatus: Onboarded
        }
        break
      default:
    }
  }
  if (args.name) where = {name: {$like: `%${args.name}%`}}
  if (args.staffType) where = {staffType: args.staffType}

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

  let $staffNames = await models.staff.findAll({
    where,
    attributes: ['id', 'name', 'flowStatus', 'staffType'],
    include: [{
      model: models.positionLog,
      attributes: ['id', 'name', 'staffId', 'flowStatus'],
      separate: true,
      order: [['entryDate', 'DESC'], ['year', 'DESC']],
      limit: 1
    }]
  })

  return $staffNames
}
