const
  {models} = require('../../models/index'),
  {addTitle} = require('../../src/systems/title'),
  {staffType} = require('config').get('args'),
  {staffStatus} = require('config').get('flowCfg'),
  uuidv1 = require('uuid/v1'),
  moment = require('moment'),
  {insertStaffHistory} = require('./insertStaffHistory'),
  {insertIncreaseLog} = require('./insertIncreaseLog'),
  {insertSalaryStructure} = require('./insertSalaryStructure')


async function insertStaff (workbook, t) {
  const fieldIndex = {
    name: 3,
    leader: 4,
    gender: 5,
    companyId: 6,
    titleId: 7,
    stdPosId: 9,
    skillLevel: 10,
    year: 11,
    entryDate: 12,
    increaseCycle: 13,
    nextIncreaseMonth: 14,
    increaseRate: 15,
    noticePeriod: 16,
    validDate: 17
  }
  let salaryTypeIndex = {}

  let staffInfos = []
  let staffs = []
  let worksheet = workbook.getWorksheet('Staff')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {

    if (rowNumber === 2) {
      row.eachCell((cell, colNumber) => {
        if (colNumber > fieldIndex.validDate &&
          cell.text && cell.text !== ''
        ) {
          salaryTypeIndex[cell.text] = colNumber
        }
      })
    }

    if (rowNumber > 2 && row.getCell(3).text) {
      let staffInfo = {
        id: uuidv1(),
        salaryDistributions: []
      }

      for (let key in fieldIndex) {
        let dateKeys = ['nextIncreaseMonth', 'validDate']

        if (dateKeys.includes(key)) staffInfo[key] = row.getCell(fieldIndex[key]).value
        else staffInfo[key] = row.getCell(fieldIndex[key]).text

        for (let dateKey of dateKeys) {
          // console.log('staffInfo[dateKey]: ', staffInfo[dateKey])
          if (key === dateKey) staffInfo[dateKey] = moment(staffInfo[dateKey]).format('YYYY-MM')
        }
      }

      for (let key in salaryTypeIndex) {
        staffInfo.salaryDistributions.push({
          salaryTypeId: key,
          amount: row.getCell(salaryTypeIndex[key]).text || 0,
        })
      }
      staffInfos.push(staffInfo)
    }
  })

  for (let staffInfo of staffInfos) {
    let staff = {
      ...staffInfo,
      staffType: staffType.Regular,
      flowStatus: staffStatus.Onboarded
    }

    let $stdPosDetail = await models.stdPosDetail.findOne({
      where: {
        stdPosId: staff.stdPosId,
        skillLevel: staff.skillLevel,
        year: staff.year
      },
      transaction: t
    })

    if (!$stdPosDetail) {
      console.log('staff: ', staff)
    }

    let $stdPos = await models.stdPos.findById(staff.stdPosId, {transaction: t})
    let sameKeys = ['teamId', 'officeId', 'currencyId', 'location']

    staff.stdPosDetailId = $stdPosDetail.id
    for (let key of sameKeys) staff[key] = $stdPos[key]
    staffs.push(staff)

    await addTitle(staff.titleId, t)

    staffInfo.currencyId = $stdPos.currencyId
  }

  await models.staff.bulkCreate(staffs, {transaction: t})
  await insertStaffHistory(staffInfos, t)
  await insertIncreaseLog(staffInfos, t)
  await insertSalaryStructure(staffInfos, t)
  console.log('Staff 初始化完成！')
}

exports.insertStaff = insertStaff
