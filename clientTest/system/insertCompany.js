const
  {models} = require('../../models/index'),
  {payorType} = require('config').get('args'),
  m100 = require('../m100')


async function insertCompany (workbook, t) {
  const fieldIndex = {
    id: 3,
    name: 4,
    contact: 5,
    telephone: 6,
    address: 7,
    email: 8,
  }

  let companys = []
  let worksheet = workbook.getWorksheet('Company')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let company = {}

      for (let key in fieldIndex) {
        company[key] = row.getCell(fieldIndex[key]).text
      }
      companys.push(company)
    }
  })

  await models.company.bulkCreate(companys, {transaction: t})
  await insertCompanyDetail(workbook, t)
  console.log('Company 初始化完成！')
}

exports.insertCompany = insertCompany

async function insertCompanyDetail (workbook, t) {
  const fieldIndex = {
    companyId: 3,
    year: 4,
    rate: 5,
    min: 6,
    max: 7,
  }

  let companyDetails = []
  let worksheet = workbook.getWorksheet('Company Rate')

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let companyDetail = {
        payorType: payorType.Company
      }

      for (let key in fieldIndex) {
        companyDetail[key] = row.getCell(fieldIndex[key]).text
      }
      companyDetails.push(companyDetail)
    }
  })
  companyDetails = m100(companyDetails, ['min', 'max'])

  await models.companyDetail.bulkCreate(companyDetails, {transaction: t})
}
