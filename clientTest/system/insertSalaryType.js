const
  {models} = require('../../models/index'),
  {staffType} = require('config').get('args')

const freelancerSalaryTypes = [
  {id: 'Freelancer Daily Salary', staffType: staffType.Freelancer},
  {id: 'Freelancer Monthly Salary', staffType: staffType.Freelancer},
  {id: 'Freelancer One Time Salary', staffType: staffType.Freelancer},
]

async function insertSalaryType (workbook, t) {
  const fieldIndex = {
    index: 2,
    id: 3,
    category: 4,
    location: 5,
    distributeType: 6,
  }

  let salaryTypes = []
  let worksheet = workbook.getWorksheet('Salary Type')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let salaryType = {}

      for (let key in fieldIndex) {
        salaryType[key] = row.getCell(fieldIndex[key]).text
      }
      salaryTypes.push(salaryType)
    }
  })

  freelancerSalaryTypes.forEach((freelancerSalaryType, index) => {
    freelancerSalaryType.index = salaryTypes.length + index + 1
  })
  salaryTypes = [...salaryTypes, ...freelancerSalaryTypes]

  await models.salaryType.bulkCreate(salaryTypes, {transaction: t})
  console.log('SalaryType 初始化完成！')
}

exports.insertSalaryType = insertSalaryType
