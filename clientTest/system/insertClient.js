const
  {models} = require('../../models/index'),
  uuidv1 = require('uuid/v1')


async function insertClient (workbook, t) {
  const fieldIndex = {
    id: 3,
    brief: 4,
    type: 5,
    contact: 6,
    telephone: 7,
    address: 8,
    email: 9,
    incentiveRate: 10,
    taxDiscountRate: 11,
  }

  let clients = []
  let worksheet = workbook.getWorksheet('Client')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let client = {}

      for (let key in fieldIndex) {
        client[key] = row.getCell(fieldIndex[key]).text
      }
      clients.push(client)
    }
  })

  await models.client.bulkCreate(clients, {transaction: t})
  await insertTeam(workbook, t)
  console.log('Client 初始化完成！')
}

exports.insertClient = insertClient


async function insertTeam (workbook, t) {
  const fieldIndex = {
    clientId: 3,
    name: 4,
    brief: 5,
  }

  let teams = {}
  let ClientTeams = []
  let worksheet = workbook.getWorksheet('Client-Team')

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let team

      if (teams[row.getCell(fieldIndex.name).text]) team = teams[row.getCell(fieldIndex.name).text]
      else team = {id: uuidv1()}

      for (let key in fieldIndex) {
        team[key] = row.getCell(fieldIndex[key]).text
      }
      teams[team.name] = team
      ClientTeams.push({
        teamId: team.id,
        clientId: team.clientId
      })
    }
  })

  await models.team.bulkCreate(Object.values(teams), {transaction: t})
  await models.ClientTeam.bulkCreate(ClientTeams, {transaction: t})
}
