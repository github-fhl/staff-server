const
  {models} = require('../../../models'),
  cfg = require('config').get('args');

module.exports = async () => {
  let $staffs = await models.staff.findAll({
    where: {staffType: {$in: cfg.orgNodeLeaderType}, flowStatus: {$ne: 'Left'}, status: 1},
    attributes: ['id', 'name']
  })

  return $staffs
}
