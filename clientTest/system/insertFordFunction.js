const
  {models} = require('../../models/index')

async function insertFordFunction (workbook, t) {
  const fieldIndex = {
    id: 3
  }

  let fordFunctions = []
  let groupNum = 1
  let worksheet = workbook.getWorksheet('FordFunction')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let fordFunction = {}

      for (let key in fieldIndex) {
        fordFunction[key] = row.getCell(fieldIndex[key]).text
        fordFunction.group = groupNum
      }
      fordFunctions.push(fordFunction)

      groupNum += 1
    }
  })

  await models.fordFunction.bulkCreate(fordFunctions, {transaction: t})
  console.log('FordFunction 初始化完成！')
}

exports.insertFordFunction = insertFordFunction
