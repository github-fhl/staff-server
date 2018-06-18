const
  {models} = require('../../models/index'),
  uuidv1 = require('uuid/v1')


async function insertCurrency (workbook, t) {
  const fieldIndex = {
    id: 3,
    country: 4,
    year: 5,
    constantRateToUSD: 6,
    fordRateToUSD: 7,
    constantRateToRMB: 8,
    fordRateToRMB: 9,
  }

  let currencys = {}
  let currencyDetails = []
  let worksheet = workbook.getWorksheet('Currency')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let currency = {}

      for (let key in fieldIndex) {
        currency[key] = row.getCell(fieldIndex[key]).text
      }
      currencys[currency.id] = currency
      currencyDetails.push({
        ...currency,
        currencyId: currency.id,
        id: uuidv1()
      })
    }
  })

  await models.currency.bulkCreate(Object.values(currencys), {transaction: t})
  await models.currencyDetail.bulkCreate(currencyDetails, {transaction: t})
  console.log('Currency 初始化完成！')
}

exports.insertCurrency = insertCurrency
