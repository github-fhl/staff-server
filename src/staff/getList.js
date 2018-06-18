const
  {ApiDialect} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrStaff, attrSalaryStructure, attrSalaryDistribution} = require('../args'),
  {salaryType, staffType} = require('config').get('args')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'leaveDate', 'stopPayDate']
        })
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $staffs = await models.staff.findAll({
    attributes: attrStaff,
    where: {staffType: staffType.Regular},
    include: [{
      model: models.team,
      attributes: ['name']
    }, {
      model: models.stdPos,
      attributes: ['name'],
      as: 'stdPos'
    }, {
      model: models.positionLog,
      attributes: ['name', 'seqNo', 'positionId', 'staffId'],
      separate: true,
      order: [['entryDate', 'DESC'], ['year', 'DESC']],
      limit: 1
    }, {
      model: models.salaryStructure,
      attributes: attrSalaryStructure,
      include: [{
        model: models.salaryDistribution,
        required: false,
        where: {
          salaryTypeId: {
            $in: [salaryType['Monthly Salary'], salaryType.COLA, salaryType.Meal]
          }
        },
        attributes: attrSalaryDistribution
      }],
      separate: true,
      order: [['validDate', 'DESC']],
      limit: 1
    }, {
      model: models.staffHistory,
      separate: true,
      limit: 1,
      order: [['entryDate', 'DESC']],
      attributes: ['id', 'staffId', 'entryDate', 'leaveDate', 'nextIncreaseMonth']
    }],
    order: [
      [models.team, 'name', 'ASC'],
      [{model: models.stdPos, as: 'stdPos'}, 'name', 'ASC'],
      ['name', 'ASC']
    ]
  })

  return $staffs
}
