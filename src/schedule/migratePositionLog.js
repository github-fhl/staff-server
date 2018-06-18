const
  {models, sequelize} = require('../../models/index'),
  schedule = require('node-schedule'),
  uuidv1 = require('uuid/v1'),
  moment = require('moment'),
  {Open} = require('config').get('flowCfg').positionLogStatus,
  {migratePositionLogRule} = require('./rules'),
  {createLogSalaryDistribution} = require('../positionLog/createLogSalaryDistribution'),
  {queryHCCategory} = require('../position/getHCCategory')

/**
 *
 * 1. 查找今年所有的 Position
 * 2. 根据 name 查找去年的 position 的最后一条 log
 *    1. 存在
 *        - 根据最后一条 log 复制生成一条新的 Log
 *        - 将 positionLog 中存在的员工迁移到新 Log 中
 *    2. 不存在，则根据 stdPos、level 创建一条 seqno 为 A 的新 Log
 *
 */

// todo 迁移完 positionLog 后，对于正在执行中的 申请单，更新其 log 相关的 ID

exports.migratePositionLog = schedule.scheduleJob(migratePositionLogRule, () => {
  let nowYear = moment().year()

  sequelize.transaction(t => migrate(nowYear, t))
})


async function migrate (nowYear, t) {
  let $positions = await models.position.findAll({
    transaction: t,
    where: {year: nowYear}
  })

  for (let $position of $positions) {
    let $oldPositionLog = await models.positionLog.findOne({
      transaction: t,
      where: {
        year: nowYear - 1,
        name: $position.name
      },
      order: [['seqNo', 'DESC']],
      include: [{
        model: models.salaryDistribution
      }]
    })

    if ($oldPositionLog) await copyOldLog($oldPositionLog, nowYear, $position.id, t)
    else await createLog($position, nowYear, t)
  }
}
exports.migratePositionLogRun = migrate

/**
 * 对于去年、今年都存在的 position，复制去年的 log
 * 1. 生成新的 log，更新 year、positionId，stdPosDetailId
 * 2. 复制一份 salaryDistribution
 * 3. 对应更新 position 的 数据
 */

async function copyOldLog ($oldPositionLog, nowYear, positionId, t) {

  let $newStdPosDetail = await models.stdPosDetail.findOne({
    transaction: t,
    where: {
      stdPosId: $oldPositionLog.stdPosId,
      skillLevel: $oldPositionLog.skillLevel,
      year: nowYear
    }
  })
  let newPositionLog = {
    ...$oldPositionLog.dataValues,
    id: uuidv1(),
    year: nowYear,
    positionId,
    stdPosDetailId: $newStdPosDetail.id
  }

  await models.positionLog.create(newPositionLog, {transaction: t})

  let salaryDistributions = $oldPositionLog.salaryDistributions.map($salaryDistribution => ({
    salaryTypeId: $salaryDistribution.salaryTypeId,
    amount: $salaryDistribution.amount
  }))

  await createLogSalaryDistribution(newPositionLog.id, salaryDistributions, t)
  await updatePosition(newPositionLog, t)

}


/**
 * 对于去年不存在，今年存在的 position，创建新的 log
 * 1. 根据 position 生成 positionLog，seqNo = A
 * 2. 根据 stdPos 生成一份 salaryDistribution
 * 3. 对应更新 position 的 数据
 *
 */

async function createLog ($position, nowYear, t) {
  let sameField = [
    'name', 'year', 'titleId', 'companyId', 'fordFunctionId',
    'officeId', 'currencyId', 'teamId', 'stdPosId', 'skillLevel', 'location', 'sowLevel'
  ]
  let $stdPosDetail = await models.stdPosDetail.findOne({
    transaction: t,
    where: {
      stdPosId: $position.stdPosId,
      skillLevel: $position.skillLevel,
      year: nowYear
    },
    include: [{
      model: models.stdPosPrice,
      attributes: ['salaryTypeId', 'amount']
    }]
  })
  let newPositionLog = {
    id: uuidv1(),
    seqNo: 'A',
    positionId: $position.id,
    stdPosDetailId: $stdPosDetail.id,
    flowStatus: Open
  }

  sameField.forEach(key => newPositionLog[key] = $position[key])
  await models.positionLog.create(newPositionLog, {transaction: t})
  await createLogSalaryDistribution(newPositionLog.id, $stdPosDetail.stdPosPrices, t)
  await updatePosition(newPositionLog, t)
}

/**
 * 更新 position 的 HCCategory/seqNo/stdPosDetailId
 */

async function updatePosition (newPositionLog, t) {
  let HCCategory = await queryHCCategory(newPositionLog.name, newPositionLog.year, t)

  await models.position.update({
    HCCategory,
    seqNo: newPositionLog.seqNo,
    stdPosDetailId: newPositionLog.stdPosDetailId
  }, {
    transaction: t,
    where: {id: newPositionLog.positionId}
  })
}

