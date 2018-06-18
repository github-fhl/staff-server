const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {Left} = require('config').flowCfg.staffStatus

exports.updateStaffHistory = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true),
    new Arg('increaseCycle', false, 'integer'),
    new Arg('nextIncreaseMonth', false),
    new Arg('noticePeriod', false, 'number'),
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'date', 'validDate']
        })
    })
    .catch(err => api.error(err))
}

async function run (args, t) {
  let $staffHistory = await models.staffHistory.findByPrimary(args.id, {
    transaction: t,
    include: [{
      model: models.staff
    }]
  })

  if ($staffHistory.staff.flowStatus === Left) throw new Error(`${$staffHistory.staff.name} 已离职，无法编辑`)


  await models.staffHistory.update(args, {
    transaction: t,
    where: {id: args.id}
  })
}
