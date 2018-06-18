const
  {models} = require('../../../models'),
  {positionLogStatus} = require('config').flowCfg

module.exports = async args => {
  let $jobInfo = await models.positionLog.findOne({
    where: {id: args.id, flowStatus: positionLogStatus.Open},
    include: [{
      model: models.stdPos,
      attributes: ['name']
    }, {
      model: models.team,
      attributes: ['name']
    }],
    attributes: ['name', 'skillLevel', 'location', 'sowLevel', 'flowStatus', 'titleId', 'companyId', 'officeId', 'currencyId']
  })

  if ($jobInfo) {
    throw new Error('Transfer In Position is non-existent or Unavailable')
  }
  return $jobInfo;
}
