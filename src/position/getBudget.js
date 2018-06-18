const
  {ApiDialect, Arg} = require('api-dialect'),
  {budgetType} = require('config').get('args'),
  {queryPositionBudget} = require('./mixedFn'),
  {checkExist} = require('../../components/widgets')


const getBudget = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('expectStaffId', false),
    new Arg('currencyId', false),
    new Arg('stdPosDetailId', false),
    new Arg('adjustedBasicCost', false),
    new Arg('officeId', false),
    new Arg('existStaff', false),
    new Arg('year', false),  // 接收的是 position 的 year，所以需要减 1 才是 stdPosDetail 对应的年份
  ]

  if (!api.setArgs(receiveArgs)) return

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let option

  if (args.adjustedBasicCost) {
    args.adjustedBasicCost = JSON.parse(args.adjustedBasicCost)
    checkExist(args, ['officeId', 'existStaff', 'year'])
    args.existStaff = args.existStaff === 'true'
    checkExist(args.adjustedBasicCost, ['annualSalary', 'annualCola', 'bonus'])
    option = {
      type: budgetType.adjusted,
      adjustedBasicCost: args.adjustedBasicCost,
      officeId: args.officeId,
      existStaff: args.existStaff === 'true',
      year: parseInt(args.year) - 1
    }
  }
  else if (args.expectStaffId) {
    checkExist(args, ['currencyId', 'year'])
    option = {
      type: budgetType.staff,
      expectStaffId: args.expectStaffId,
      year: parseInt(args.year) - 1,
      currencyId: args.currencyId
    }
  }
  else if (args.stdPosDetailId) {
    option = {
      type: budgetType.stdPos,
      stdPosDetailId: args.stdPosDetailId
    }
  }
  else throw new Error('数据不全')


  let budget = await queryPositionBudget(option)

  return budget
}

exports.getBudget = getBudget

