const
  {RecruitRegularMachine} = require('./recruitRegularMachine'),
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../../models/index'),
  {attrRecruit, attrFlowLog, JSONkeyRecruitArr} = require('../../args'),
  {onboard, backToInterviewing} = require('config').get('flowCfg').recruitOperation,
  parseJSON = require('../../commonFn/parseJSON')

let flow = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('id', true),
    new Arg('remark', false)
  ]
  let handle = req.path.split('/')[1]

  /**
   * staffInfo
   *  - entryDate 入职日期
   *  - increaseCycle 加薪周期
   *  - nextIncreaseMonth 下次加薪年月
   *  - noticePeriod 离职提前月
   */
  if (handle === onboard) receiveArgs.push(new Arg('staffInfo', true))
  if (handle === backToInterviewing) receiveArgs.push(new Arg('isKeepCandidate', true))
  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, req.user, handle, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'leaveDate', 'createdAt']
        })
    })
    .catch(err => api.error(err))
}

async function run (args, user, handle, t) {
  let $recruit = await models.recruit.findById(args.id, {
    attributes: attrRecruit,
    transaction: t
  })

  if (!$recruit) throw new Error(`${args.id} 不存在`)
  parseJSON($recruit, JSONkeyRecruitArr)

  let machine = await (new RecruitRegularMachine($recruit, user, t)).init()

  if (handle === onboard) await machine[handle](args.staffInfo)
  else if (handle === backToInterviewing) await machine[handle](args.isKeepCandidate)
  else await machine[handle]()

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

module.exports = {
  RecruitRegularMachine,
  flow
}
