const
  {models} = require('../../models/index'),
  {Y} = require('config').get('args'),
  NP = require('number-precision'),
  {createOrUpdateOrDeleteSowPosition} = require('../../src/sowPosition/mixedFn'),
  {runGetClientCost} = require('../../src/sowPosition/getClientCost')

async function insertSowPosition (workbook, t) {
  const fieldIndex = {
    staffName: 3,
    positionId: 4,
    sowName: 5,
    FTE: 6,
  }

  let sowPositions = []
  let worksheet = workbook.getWorksheet('Position-SoW')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let sowPosition = {
        confirmFlag: Y
      }

      for (let key in fieldIndex) {
        sowPosition[key] = row.getCell(fieldIndex[key]).text
      }
      sowPositions.push(sowPosition)

      if (parseFloat(sowPosition.FTE) !== 1) {
        sowPositions.push({
          positionId: sowPosition.positionId,
          sowName: '2018 InHouse',
          FTE: NP.minus(1, sowPosition.FTE)
        })
      }
    }
  })

  for (let sowPosition of sowPositions) {
    await createSowPosition(sowPosition, t)
  }
  console.log('Position-SoW 初始化完成！')
}


// async function insertSowPosition (positions, t) {
//
//   for (let position of positions) {
//     let sowPosition = {
//       positionName: position.name,
//       sowName: position.sowName,
//       FTE: position.FTE,
//       confirmFlag: Y
//     }
//
//     await createSowPosition(sowPosition, t)
//   }
// }

exports.insertSowPosition = insertSowPosition

/**
 * 1. 获取 position、sow
 * 2. 获取 FTE 对应的 cost
 * 3. 创建 sowPosition
 */

async function createSowPosition (sowPosition, t) {

  let $position = await models.position.findOne({
    transaction: t,
    where: {id: sowPosition.positionId}
  })

  if (!$position) throw new Error(`${sowPosition.positionId} 不存在`)

  let $sow = await models.sow.findOne({
    transaction: t,
    where: {name: sowPosition.sowName}
  })

  if (!$sow) throw new Error(`${sowPosition.sowName} 不存在`)

  let fields = ['net', 'tax', 'gross', 'budgetIncentive', 'officeId']
  let cost = {
    clientId: $sow.clientId,
    FTE: sowPosition.FTE
  }

  for (let field of fields) cost[field] = $position[field]

  let clientCost = await runGetClientCost(cost, t)

  Object.assign(sowPosition, clientCost, {sowId: $sow.id, positionId: $position.id})
  await createOrUpdateOrDeleteSowPosition(sowPosition, t)
}

