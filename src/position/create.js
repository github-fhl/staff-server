const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  moment = require('moment'),
  {addTitle} = require('../systems/title'),
  {addNote} = require('../sow/PO_Note'),
  {createOrUpdateOrDeleteSowPosition} = require('../sowPosition/mixedFn'),
  {runGetClientCost} = require('../sowPosition/getClientCost'),
  {checkUpdateSowPosition} = require('../sowPosition/create'),
  {N, Y, salaryCategory} = require('config').get('args'),
  {Open} = require('config').get('flowCfg').positionLogStatus,
  {createLogSalaryDistribution} = require('../positionLog/createLogSalaryDistribution')

let create = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    ...Arg.factory(models.position),
    new Arg('noteContent', false),
    new Arg('sowId', true),
    new Arg('validDate', true),
    new Arg('invalidDate', true),
    new Arg('FTE', true),
  ]

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}


/**
 * 创建 position
 * 1. 检查名字是否在一年中不重复
 * 2. 增加对应的 title
 * 3. 增加对应的 note
 * 4. 根据 client 计算折扣后的金额
 * 5. 检查能否创建 sowPosition
 * 6. 创建 sowPosition
 * 7. 对通过 execution sow 创建的 position，额外创建对应的 positionLog
 */

async function run (args, t) {
  await checkNameUniqueOneYear(args.name, args.year, t)
  let createdTitle = await addTitle(args.titleId, t)

  args.seqNo = 'A'
  let $position = await models.position.create(args, {transaction: t})

  if (args.noteContent) {
    $position.dataValues.createdNote = await addNote(args.noteContent, $position.id, t)
  }

  $position.dataValues.createdTitle = createdTitle

  let $sow = await models.sow.findOne({
    where: {id: args.sowId},
    transaction: t
  })
  let clientCostArgs = {
    net: args.net,
    tax: args.tax,
    gross: args.gross,
    budgetIncentive: args.budgetIncentive,
    FTE: args.FTE,
    clientId: $sow.clientId,
    officeId: args.officeId
  }
  let clientCost = await runGetClientCost(clientCostArgs)
  let sowPosition = {
    sowId: args.sowId,
    positionId: $position.id,
    status: $sow.isExecution === N ? 1 : 2,
    confirmFlag: $sow.isExecution === N ? N : Y,
    ...clientCost
  }

  await checkUpdateSowPosition([sowPosition], $position.year, t)
  await createOrUpdateOrDeleteSowPosition(sowPosition, t)

  await createPositionLog($sow, $position, t)

  return $position
}

exports.create = create

/**
 * 创建 positionLog
 * 1. 对应的 sow 必须是本年的 execution
 * 2. 创建一条空的 positionLog
 * 3. 根据对应的 stdPos or staff，创建 salaryDistribution
 */

async function createPositionLog ($sow, $position, t) {
  if ($sow.isExecution === N || $sow.year !== moment().year()) return
  let attrs = ['name', 'seqNo', 'year', 'titleId', 'companyId', 'fordFunctionId', 'officeId', 'currencyId', 'teamId', 'stdPosId', 'skillLevel', 'stdPosDetailId', 'location', 'sowLevel']
  let positionLog = {
    positionId: $position.id, flowStatus: Open
  }

  for (let key of attrs) {
    positionLog[key] = $position[key]
  }

  let $positionLog = await models.positionLog.create(positionLog, {transaction: t})
  let salaryDistributions = await getSalaryDistributions($position.expectStaffId, $position.stdPosDetailId, t)

  await createLogSalaryDistribution($positionLog.id, salaryDistributions, t)

}

async function getSalaryDistributions (staffId, stdPosDetailId, t) {
  let $prices

  if (staffId) {
    let $salaryStructure = await models.salaryStructure.findOne({
      transaction: t,
      where: {staffId},
      order: [['validDate', 'DESC']],
      include: [{
        model: models.salaryDistribution,
        include: [{
          model: models.salaryType,
          required: true,
          where: {
            category: {$ne: salaryCategory.Bonus}
          }
        }]
      }]
    })

    if (!$salaryStructure) throw new Error(`员工 ${staffId} 没有 SalaryStructure`)
    $prices = $salaryStructure.salaryDistributions
  }
  else {
    $prices = await models.stdPosPrice.findAll({
      transaction: t,
      where: {
        stdPosDetailId
      }
    })
  }

  return $prices.map($price => ({
    salaryTypeId: $price.salaryTypeId,
    amount: $price.amount
  }))
}

/**
 * 检查创建 position 对应的 name，在该年是否存在
 *
 * @param {string} name position 名称
 * @param {string} year position 对应的年份
 * @param {object} t transaction
 * @return {null}
 */
async function checkNameUniqueOneYear (name, year, t) {
  let count = await models.position.count({
    where: {
      year,
      name
    },
    transaction: t
  })

  if (count !== 0) throw new Error(`${year} 年 Position 名称 ${name} 已存在`)
}
