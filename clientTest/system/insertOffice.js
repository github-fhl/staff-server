const
  {models} = require('../../models/index'),
  uuidv1 = require('uuid/v1')

async function insertOffice (workbook, t) {
  const fieldIndex = {
    id: 3,
    currencyId: 4,
    contact: 5,
    telephone: 6,
    address: 7,
    email: 8,
  }

  let offices = []
  let worksheet = workbook.getWorksheet('Office')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let client = {}

      for (let key in fieldIndex) {
        client[key] = row.getCell(fieldIndex[key]).text
      }
      offices.push(client)
    }
  })

  await models.office.bulkCreate(offices, {transaction: t})
  await insertOfficeDetail(workbook, t)
  console.log('Office 初始化完成！')
}

exports.insertOffice = insertOffice

async function insertOfficeDetail (workbook, t) {
  const fieldIndex = {
    officeId: 3,
    year: 4,
    mulRate: 5,
    dictRate: 6,
    incRate: 7,
    benRate: 8,
    overRate: 9,
    mkpRate: 10,
    taxRate: 11,
    invRate: 12,
    divRate: 13,
  }
  let officeDetails = []
  let worksheet = workbook.getWorksheet('Office Rate')

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let officeDetail = {}

      for (let key in fieldIndex) {
        officeDetail[key] = row.getCell(fieldIndex[key]).text
      }
      officeDetails.push(officeDetail)
    }
  })

  await models.officeDetail.bulkCreate([...officeDetails, ...insertNextYear(officeDetails, 1), ...insertNextYear(officeDetails, 2)], {transaction: t})
}

function insertNextYear (officeDetails, addYear) {
  return officeDetails.map(officeDetail => ({
    ...officeDetail,
    year: parseInt(officeDetail.year) + addYear
  }))
}
