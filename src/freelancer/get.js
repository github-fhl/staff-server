const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {attrStaff, attrEstimateSalary, attrFreelancerContract, attrCostDistribution, attrSalaryRecord, attrSalaryDistribution} = require('../args')

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
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'date']
        })
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $freelancer = await models.staff.findById(args.id, {
    attributes: attrStaff,
    include: [{
      model: models.estimateSalary,
      attributes: attrEstimateSalary,
      separate: true,
      order: [['month', 'ASC']]
    }, {
      model: models.freelancerContract,
      attributes: attrFreelancerContract,
      separate: true,
      order: [['entryDate', 'DESC']],
      include: [{
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

  if (!$freelancer) throw new Error(`${args.id} 不存在`)
  return $freelancer
}
