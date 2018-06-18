const
  {models} = require('../../models/index'),
  {N, clientType} = require('config').get('args'),
  {POCollected, special} = require('config').get('flowCfg').sowStatus,
  m100 = require('../m100')

async function insertSow (workbook, t) {
  const fieldIndex = {
    name: 3,
    year: 4,
    clientId: 5,
    currencyId: 6,
    media: 7,
    production: 8,
    traditional: 9,
    digital: 10,
    CRM: 11,
    travel: 12,
    total: 13,
  }

  let sows = []
  let worksheet = workbook.getWorksheet('SoW')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let sow = {
        version: '001',
        isExecution: N,
        flowStatus: POCollected
      }

      for (let key in fieldIndex) {
        sow[key] = row.getCell(fieldIndex[key]).text
      }
      sows.push(sow)
    }
  })

  for (let sow of sows) {
    let $client = await models.client.findById(sow.clientId, {transaction: t})

    if (!$client) throw new Error(`${sow.clientId} 不存在`)
    sow.sowType = $client.type
    if (sow.sowType !== clientType.Sold) sow.flowStatus = special
  }

  sows = m100(sows, ['media', 'production', 'traditional', 'digital', 'CRM', 'travel', 'total'])

  await models.sow.bulkCreate(sows, {transaction: t})
  console.log('SoW 初始化完成！')
}

exports.insertSow = insertSow
