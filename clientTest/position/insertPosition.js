const
  {models} = require('../../models/index'),
  {budgetType} = require('config').get('args'),
  {addTitle} = require('../../src/systems/title'),
  {queryPositionBudget} = require('../../src/position/mixedFn'),
  {querySowLevel} = require('../../src/position/getSowLevel'),
  {generatorPositionName} = require('../../src/position/getPositionName'),
  moment = require('moment')

async function insertPosition (workbook, t) {
  const fieldIndex = {
    id: 3,
    year: 4,
    expectStaffName: 5,
    companyId: 6,
    titleId: 7,
    fordFunctionId: 8,
    stdPosId: 10,
    skillLevel: 11,
    HCCategory: 12,
    seqNo: 13,
    validDate: 14,
    invalidDate: 15,
    FTE: 16,
    annualSalary: 17,
    annualCola: 18,
    bonus: 19,
    sowName: 20,
  }

  let positions = []
  let worksheet = workbook.getWorksheet('Position')

  if (!worksheet) return

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2 && row.getCell(3).text) {
      let position = {}

      for (let key in fieldIndex) {
        position[key] = row.getCell(fieldIndex[key]).text

        if (['validDate', 'invalidDate'].includes(key)) {
          position[key] = moment(position[key]).format('YYYY-MM-DD')
        }

      }
      positions.push(position)
    }
  })

  for (let position of positions) {
    position.year = moment(position.validDate).year()

    await getPosition(position, t)
  }

  for (let position of positions) {
    await getName(position, t)
    await models.position.create(position, {transaction: t})
  }

  console.log('Position 初始化完成！')

  return positions
}

exports.insertPosition = insertPosition


/**
 * 1. 获取对应员工 ID
 * 2. 根据 stdpos 获取对应的 office、team 等
 * 3. 获取对应的预算、sowLevel
 * 4. 创建 position
 */

async function getPosition (position, t) {
  await getStaff(position, t)
  await getStdPosInfo(position, t)
  await queryBudgetAndSowLevel(position, t)
}

async function getStaff (position, t) {
  if (position.expectStaffName) {
    let $staff = await models.staff.findOne({
      transaction: t,
      where: {name: position.expectStaffName}
    })

    console.log('staffName: ', position.expectStaffName)

    if (!$staff) throw new Error(`${position.expectStaffName} 不存在`)
    position.expectStaffId = $staff.id
  }
}

async function getStdPosInfo (position, t) {

  let $stdPosDetail = await models.stdPosDetail.findOne({
    where: {
      stdPosId: position.stdPosId,
      skillLevel: position.skillLevel,
      year: position.year - 1
    },
    transaction: t
  })

  if (!$stdPosDetail) {
    console.log('position: ', position)
  }

  let $stdPos = await models.stdPos.findById(position.stdPosId, {transaction: t})
  let sameKeys = ['teamId', 'officeId', 'currencyId', 'location']

  position.stdPosDetailId = $stdPosDetail.id
  for (let key of sameKeys) position[key] = $stdPos[key]

  await addTitle(position.titleId, t)

}

async function queryBudgetAndSowLevel (position, t) {

  let $staff = await models.staff.findOne({
    transaction: t,
    where: {name: position.expectStaffName}
  })

  let option = {
    type: budgetType.staff,
    // adjustedBasicCost: {
    //   annualSalary: position.annualSalary,
    //   annualCola: position.annualCola,
    //   bonus: position.bonus,
    // },
    officeId: position.officeId,
    existStaff: position.expectStaffName ? true : false,
    expectStaffId: $staff.id,
    currencyId: position.currencyId,
    year: parseInt(position.year) - 1
  }


  let budget = await queryPositionBudget(option, t)

  Object.assign(position, budget)
  position.sowLevel = await querySowLevel(position.directComp, position.currencyId, parseInt(position.year) - 1, t)
}

/**
 * 获取 positionName
 */

async function getName (position, t) {
  let $sow = await models.sow.findOne({
    transaction: t,
    where: {name: position.sowName},
    include: [{
      model: models.client
    }]
  })
  let $team = await models.team.findByPrimary(position.teamId, {transaction: t})

  position.name = await generatorPositionName($sow.client.brief, $team.brief, position.year, t)
}
