const
  {models} = require('../../models/index'),
  {level1} = require('config').get('args').sowLevelType,
  {Closed} = require('config').get('flowCfg').positionLogStatus,
  {createLogSalaryDistribution} = require('../../src/positionLog/createLogSalaryDistribution'),
  {getLogSowLevel} = require('../../src/positionLog/getLogSowLevel')

// async function insertPositionLog (workbook, t) {
//   const fieldIndex = {
//     positionName: 3,
//     staffName: 4,
//     seqNo: 5,
//     entryDate: 6,
//     leaveDate: 7,
//   }
//
//   let positionLogs = []
//   let worksheet = workbook.getWorksheet('Staff-Position')
//
//   if (!worksheet) return
//
//   worksheet.eachRow((row, rowNumber) => {
//     if (rowNumber > 2 && row.getCell(3).text) {
//       let positionLog = {}
//
//       for (let key in fieldIndex) {
//         positionLog[key] = row.getCell(fieldIndex[key]).text
//       }
//       positionLogs.push(positionLog)
//     }
//   })
//
//   for (let positionLog of positionLogs) {
//     await createPositionLog(positionLog, t)
//   }
//
//   console.log('PositionLog 初始化完成！')
// }


async function insertPositionLog (positions, t) {
  for (let position of positions) {
    let positionLog = {
      positionName: position.name,
      staffName: position.expectStaffName,
      seqNo: 'A',
      entryDate: position.validDate,
      leaveDate: null
    }

    await createPositionLog(positionLog, t)
  }

}

exports.insertPositionLog = insertPositionLog

/**
 * 1. 获取 staff、position 中的信息，并创建 positionLog，其 sowLevel 为胡乱编写
 * 2. 将 staff 的 salaryDistribution 复制入 PositionLog 中
 * 3. 计算 sowLevel
 * 4. 更新对应 staffHistory 的 positionLogId
 */

async function createPositionLog (positionLog, t) {
  await queryPositionLogInfo(positionLog, t)

  let $positionLog = await models.positionLog.create(positionLog, {transaction: t})

  await bulkSalaryDistribution($positionLog, t)

  $positionLog.sowLevel = await getLogSowLevel($positionLog.id, t)
  await $positionLog.save({transaction: t})

  if ($positionLog.staffId) {
    await models.staffHistory.update({positionLogId: $positionLog.id}, {
      transaction: t,
      where: {
        staffId: $positionLog.staffId
      }
    })
  }
}


async function queryPositionLogInfo (positionLog, t) {

  let $position = await models.position.findOne({
    transaction: t,
    where: {name: positionLog.positionName}
  })
  let $staff = await models.staff.findOne({
    transaction: t,
    where: {name: positionLog.staffName}
  })

  if (!$position) throw new Error(`${positionLog.positionName} 不存在`)
  if (!$staff) throw new Error(`${positionLog.staffName} 不存在`)

  let staffFields = ['location', 'companyId', 'currencyId', 'officeId', 'teamId', 'titleId', 'stdPosId', 'stdPosId', 'skillLevel', 'stdPosDetailId']
  let positionFields = ['name', 'year', 'fordFunctionId']

  for (let field of staffFields) positionLog[field] = $staff[field]
  for (let field of positionFields) positionLog[field] = $position[field]

  let info = {
    positionId: $position.id,
    staffId: $staff.id,
    sowLevel: level1,
    flowStatus: Closed
  }

  Object.assign(positionLog, info)
}

async function bulkSalaryDistribution ($positionLog, t) {
  let $salaryStructure = await models.salaryStructure.findOne({
    transaction: t,
    where: {
      staffId: $positionLog.staffId
    },
    order: [['validDate', 'DESC']],
    include: [{
      model: models.salaryDistribution,
      separate: true,
    }]
  })
  let salaryDistributions = $salaryStructure.salaryDistributions.map(salaryDistribution => ({
    salaryTypeId: salaryDistribution.salaryTypeId,
    amount: salaryDistribution.amount
  }))

  await createLogSalaryDistribution($positionLog.id, salaryDistributions, t)
}
