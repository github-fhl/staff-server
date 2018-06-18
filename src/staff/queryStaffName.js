const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  moment = require('moment')

exports.queryStaffName = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('name', true)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let $staff = await models.staff.findOne({
    where: {name: args.name},
    include: [{
      model: models.staffHistory,
      separate: true,
      order: [['entryDate', 'DESC']],
      limit: 1
    }]
  })

  if (!$staff) return null

  let msg = `员工 ${$staff.name} 已存在，其员工类别为 ${$staff.staffType}，状态为 ${$staff.flowStatus}，入职日期为 ${moment($staff.staffHistories[0].entryDate).format('YYYY-MM-DD')}`

  if ($staff.staffHistories[0].leaveDate) msg += `，离职日期为 ${moment($staff.staffHistories[0].leaveDate).format('YYYY-MM-DD')}`
  return msg
}
