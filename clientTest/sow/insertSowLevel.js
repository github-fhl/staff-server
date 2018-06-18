const
  {models} = require('../../models/index'),
  {RMB} = require('config').get('args'),
  m100 = require('../m100')

async function insertSowLevel (workbook, t) {
  const fieldIndex = {
    year: 3,
    level1Max: 4,
    level2Max: 5,
    level3Max: 6,
    level4Max: 7,
  }

  let sowLevels = []
  let worksheet = workbook.getWorksheet('SoW Level')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let sowLevel = {
        currencyId: RMB
      }

      for (let key in fieldIndex) {
        sowLevel[key] = row.getCell(fieldIndex[key]).text
      }
      sowLevels.push(sowLevel)
    }
  })

  let fields = ['level1Max', 'level2Max', 'level3Max', 'level4Max']

  sowLevels = m100(sowLevels, fields)

  await models.sowLevel.bulkCreate(sowLevels, {transaction: t})
  console.log('SoW Level 初始化完成！')
}

exports.insertSowLevel = insertSowLevel
