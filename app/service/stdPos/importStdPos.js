const
  {models} = require('../../../models'),
  path = require('path'),
  {uploadPath} = require('config'),
  Excel = require('excelJs'),
  createOrUpdate = require('./createOrUpdate'),
  m100 = require('../../../clientTest/m100')

module.exports = async (args, t) => {
  let workbook = new Excel.Workbook();

  await workbook.xlsx.readFile(path.join(uploadPath, path.join('stdPos', args.filePath)));

  let worksheet1 = workbook.getWorksheet('StdPos');
  let worksheet2 = workbook.getWorksheet('StdPos Price');

  let stdPosArray = await getStdPos(worksheet1)
  let obj = await getStdPosDetailArray(worksheet2);

  await createOrUpdate(stdPosArray, obj, t)
}

async function getStdPos (worksheet) {
  let fieldIndex = {
    order: 2,
    name: 3,
    office: 4,
    team: 5,
    location: 6,
    currency: 7
  }

  let $teams = await models.team.findAll({where: {status: 1}});
  let teamObj = {};
  let stdPos = [];

  for (let $team of $teams) {
    teamObj[$team.name] = $team.id;
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(2).text) {
      let teamName = row.getCell(fieldIndex.team).text;

      if (!teamObj[teamName]) {
        throw new Error(`Team Code ${teamName}不存在`)
      }
      stdPos.push({
        order: row.getCell(fieldIndex.order).text,
        name: row.getCell(fieldIndex.name).text,
        location: row.getCell(fieldIndex.location).text,
        teamId: teamObj[teamName],
        officeId: row.getCell(fieldIndex.office).text,
        currencyId: row.getCell(fieldIndex.currency).text
      })
    }
  })

  return stdPos;
}

function getStdPosDetailArray (worksheet) {
  let fieldIndex = {
    order: 2,
    stdPosOrder: 4,
    year: 5,
    skillLevel: 6
  }
  let stdPosDetailArray = [];
  let stdPosPriceArray = [];
  let salaryTypeIdIndex = {};

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

    if (rowNumber > 2 && row.getCell(2).text) {
      stdPosDetailArray.push({
        order: row.getCell(fieldIndex.order).text,
        stdPosOrder: row.getCell(fieldIndex.stdPosOrder).text,
        year: Number(row.getCell(fieldIndex.year).text),
        skillLevel: row.getCell(fieldIndex.skillLevel).text
      })

      for (let key in salaryTypeIdIndex) {
        stdPosPriceArray.push({
          stdPosDetailOrder: row.getCell(fieldIndex.order).text,
          amount: row.getCell(salaryTypeIdIndex[key]).text ? Number(row.getCell(salaryTypeIdIndex[key]).text) : 0,
          salaryTypeId: key
        })
      }
    }
  })
  stdPosPriceArray = m100(stdPosPriceArray, ['amount']);
  return {stdPosDetailArray, stdPosPriceArray}
}
