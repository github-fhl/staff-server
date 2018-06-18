const
  {models} = require('../../models/index'),
  uuidv1 = require('uuid/v1'),
  m100 = require('../m100')

async function insertStdPos (workbook, t) {
  const fieldIndex = {
    id: 2,
    name: 3,
    officeId: 4,
    teamName: 5,
    location: 6,
    currencyId: 7,
  }

  let StdPosList = []
  let worksheet = workbook.getWorksheet('StdPos')

  if (!worksheet) return

  let $teams = await models.team.findAll({transaction: t})

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let stdPos = {}

      for (let key in fieldIndex) {
        stdPos[key] = row.getCell(fieldIndex[key]).text
      }

      $teams.forEach($team => {
        if ($team.name === stdPos.teamName) stdPos.teamId = $team.id
      })
      StdPosList.push(stdPos)
    }
  })

  await models.stdPos.bulkCreate(StdPosList, {transaction: t})
  await insertStdPosDetail(workbook, t)
  console.log('StdPos 初始化完成！')
}
exports.insertStdPos = insertStdPos

async function insertStdPosDetail (workbook, t) {
  const fieldIndex = {
    stdPosId: 4,
    year: 5,
    skillLevel: 6,
  }

  let stdPosDetails = []
  let stdPosPrices = []
  let worksheet = workbook.getWorksheet('StdPos Price')
  let salaryTypeIdIndex = {}

  worksheet.eachRow((row, rowNumber) => {

    if (rowNumber === 2) {
      row.eachCell((cell, colNumber) => {
        if (colNumber > fieldIndex.skillLevel &&
          cell.text && cell.text !== ''
        ) {
          salaryTypeIdIndex[cell.text] = colNumber
        }
      })
    }

    if (rowNumber > 2 && row.getCell(3).text) {
      let stdPosDetail = {
        id: uuidv1()
      }

      for (let key in fieldIndex) {
        stdPosDetail[key] = row.getCell(fieldIndex[key]).text
      }
      stdPosDetails.push(stdPosDetail)

      for (let key in salaryTypeIdIndex) {

        stdPosPrices.push({
          stdPosDetailId: stdPosDetail.id,
          salaryTypeId: key,
          amount: row.getCell(salaryTypeIdIndex[key]).text || 0
        })
      }
    }
  })

  stdPosPrices = m100(stdPosPrices, ['amount'])

  let {newStdPosDetails, newStdPosPrices} = insertNextYear(stdPosDetails, stdPosPrices, [1, 2])

  await models.stdPosDetail.bulkCreate([...stdPosDetails, ...newStdPosDetails], {transaction: t})
  await models.stdPosPrice.bulkCreate([...stdPosPrices, ...newStdPosPrices], {transaction: t})
}

function insertNextYear (stdPosDetails, stdPosPrices, addYears) {
  let
    newStdPosDetails = [],
    newStdPosPrices = []

  addYears.forEach(addYear => {
    stdPosDetails.forEach(stdPosDetail => {
      let newId = uuidv1()

      stdPosPrices.forEach(stdPosPrice => {
        if (stdPosPrice.stdPosDetailId === stdPosDetail.id) {
          newStdPosPrices.push({
            ...stdPosPrice,
            stdPosDetailId: newId
          })
        }
      })

      newStdPosDetails.push({
        ...stdPosDetail,
        id: newId,
        year: parseInt(stdPosDetail.year) + addYear
      })
    })
  })

  return {newStdPosDetails, newStdPosPrices}
}
