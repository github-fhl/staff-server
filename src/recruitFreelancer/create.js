const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  moment = require('moment'),
  {attrRecruit, attrFlowLog, JSONkeyRecruitArr} = require('../args'),
  {RecruitFreelancerMachine} = require('./stateMachine'),
  {formType} = require('config').get('args'),
  {recruitStatus} = require('config').get('flowCfg'),
  {parseJSON, getFormId} = require('../commonFn')

exports.create = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('recruitType', true)
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, req.user, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args, user, t) {

  let recruit = {
    recruitType: args.recruitType,
    flowStatus: recruitStatus.JDCollected
  }

  recruit.id = await getFormId(moment(), formType.recruitFreelancer, t)
  recruit.basicInfo = {
    companyId: 'GTB SH',
    currencyId: 'RMB',
    officeId: 'Shanghai Onsite'
  }

  let $recruit = await models.recruit.create(recruit, {transaction: t})
  let machine = await (new RecruitFreelancerMachine($recruit, user, t)).init()

  await machine.collectJD()

  $recruit = await models.recruit.findOne({
    transaction: t,
    where: {id: $recruit.id},
    attributes: attrRecruit,
    include: [{
      model: models.flowLog,
      attributes: attrFlowLog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  })
  parseJSON($recruit.dataValues, JSONkeyRecruitArr)
  return $recruit
}
