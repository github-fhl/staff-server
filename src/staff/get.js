const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrStaff, attrStaffHistory, attrSalaryStructure, attrSalaryDistribution, attrSalaryRecord, attrCostDistribution} = require('../args')

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'leaveDate', 'stopPayDate', 'date', 'nextIncreaseMonth']
        })
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $staff = await models.staff.findOne({
    attributes: attrStaff,
    where: {
      id: args.id
    },
    include: [{
      model: models.positionLog,
      attributes: ['id', 'name', 'seqNo', 'staffId', 'flowStatus'],
      separate: true,
      order: [['entryDate', 'DESC'], ['year', 'DESC']],
      limit: 1
    }, {
      model: models.staffHistory,
      separate: true,
      attributes: attrStaffHistory,
      order: [['entryDate', 'DESC']]
    }, {
      model: models.salaryStructure,
      separate: true,
      attributes: attrSalaryStructure,
      order: [['validDate', 'DESC']],
      include: [{
        model: models.salaryDistribution,
        separate: true,
        attributes: attrSalaryDistribution,
        include: [{
          model: models.salaryType,
          attributes: ['id', 'index', 'category', 'distributeType', 'location']
        }],
        order: [[models.salaryType, 'index', 'ASC']]
      }]
    }, {
      model: models.salaryRecord,
      separate: true,
      attributes: attrSalaryRecord,
      order: [['date', 'DESC']],
      include: [{
        model: models.salaryDistribution,
        separate: true,
        attributes: attrSalaryDistribution,
        include: [{
          model: models.salaryType,
          attributes: ['id', 'index', 'category', 'distributeType', 'location']
        }],
        order: [[models.salaryType, 'index', 'ASC']]
      }, {
        model: models.costDistribution,
        attributes: attrCostDistribution,
        include: [{
          model: models.position,
          as: 'position',
          attributes: ['id', 'name']
        }, {
          model: models.project,
          as: 'project',
          attributes: ['id', 'name', 'description']
        }, {
          model: models.production,
          as: 'production',
          attributes: ['id', 'description']
        }, {
          model: models.inhouseFreelancer,
          as: 'inhouseFreelancer',
          attributes: ['id', 'description']
        }]
      }]
    }]
  })

  return $staff
}
