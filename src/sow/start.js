const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {createOrUpdateOrDeleteSowPosition} = require('../sowPosition/mixedFn'),
  {queryPositionBudget} = require('../position/mixedFn'),
  {querySowLevel} = require('../position/getSowLevel'),
  {runGetClientCost} = require('../sowPosition/getClientCost'),
  config = require('config'),
  uuidv1 = require('uuid/v1'),
  NP = require('number-precision'),
  {attrPosition, attrPositionLog} = require('../args'),
  {clientType, Y, N, budgetType} = config.args,
  {
    POCollected, disabled, special
  } = config.flowCfg.sowStatus

let startSow = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('year', true, 'integer')
  ]

  if (!api.setArgs(receiveArgs)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}


/**
 * 1、检查是否可以开启明年的 sow
 * 2、复制本年的 execution sold、backOffice sow，复制后的状态为 disabled，版本为 000
 * 3、根据复制的 sow，获取其包含的 positionId
 *
 * @param {object} args 参数
 *    - year sow 的年份
 * @param {object} t transaction
 * @return {object}
 */
async function run (args, t) {
  await checkStartSow(args.year, t)
  let positionIds = await bulkCopySow(args.year, t)

  let
    newPositionList = [],
    newSowPositionList = []

  for (let positionId of positionIds) {
    let {newPosition, newSowPositions} = await copyPosition(positionId, args.year, t)

    newPositionList.push(newPosition)
    newSowPositionList = [...newSowPositionList, ...newSowPositions]
  }

  await models.position.bulkCreate(newPositionList, {transaction: t})

  for (let newSowPosition of newSowPositionList) {
    await createOrUpdateOrDeleteSowPosition(newSowPosition, t)
  }
  // await models.sowPosition.bulkCreate(newSowPositionList, {transaction: t})
}

exports.startSow = startSow

/**
 * 检查是否可以开启 sow
 * 1. 开启年份没有 sow
 * 2. 2017 年只能创建 2018 年的 sow
 * 3. 是否存在 year = sow.year - 1 的 sowLevel，不存在则不能创建
 * 4. 去年的 sow 中如果存在还未确认的，则不能开启新的 sow
 *
 * @param {number} year sow 的年份
 * @param {object} t transaction
 * @return {null}
 */
async function checkStartSow (year, t) {
  let nowYear = (new Date()).getFullYear()

  if (nowYear + 1 !== year) throw new Error(`只能启动 ${nowYear + 1} 年份的 SoW`)

  let count = await models.sow.count({
    where: {year},
    transaction: t
  })

  if (count !== 0) throw new Error(`${year}年已启动 SOW`)

  let $sowLevel = await models.sowLevel.findOne({
    where: {year: year - 1},
    transaction: t
  })

  if (!$sowLevel) throw new Error(`还未生成 ${year - 1} 年的 SoW Level，无法启动 SoW`)

  let countOld = await models.sow.count({
    transaction: t,
    where: {
      flowStatus: {$notIn: [POCollected, disabled, special]}
    }
  })

  if (countOld !== 0) throw new Error(`${year - 1} 年份还存在未确认的 SoW`)
}

/**
 * 复制生成 sow
 * 1. 检查是否能够进行复制
 * 2. 复制本年的 execution sow ，包括 sold/backOffice/inhouse/letGo
 * 3. 复制生成后的版本为 disabled，版本号为 000
 * 4. 获取除了 letGo ，其余所有 sow 中包含的 positionId
 *
 * @param {number} year 年份
 * @param {object} t transaction
 * @return {array} positionIds 返回去年 sow 中所包含的所有 position 的 id
 */
async function bulkCopySow (year, t) {
  let $oldSows = await models.sow.findAll({
    where: {
      year: year - 1,
      isExecution: Y
    },
    attribute: ['name', 'year', 'clientId', 'sowType', 'currencyId'],
    transaction: t,
    include: [{
      model: models.position
    }]
  })
  let newSows = {},
    positionIds = []

  $oldSows.forEach($oldSow => {
    let newName = $oldSow.name.replace($oldSow.year, year)

    if (newSows[newName]) throw new Error('新 SoW 的名字存在重复，请联系维护人员')

    newSows[newName] = {
      name: newName,
      year,
      version: '000',
      clientId: $oldSow.clientId,
      sowType: $oldSow.sowType,
      currencyId: $oldSow.currencyId,
      flowStatus: disabled,
      isExecution: N
    }

    if ($oldSow.sowType !== clientType.Sold) newSows[newName].flowStatus = special

    if ($oldSow.sowType !== clientType.LetGo) {
      $oldSow.positions.forEach($position => {
        positionIds.push($position.id)
      })
    }
  })

  await models.sow.bulkCreate(Object.values(newSows), {transaction: t})
  return [...new Set(positionIds)]
}

/**
 * 复制 position
 * 1. 检查 position，如果 FTE !== 1
 *      1. 如果 invalidDate === 对应年的最后一天
 *          - 那么将新 position 的 validDate === 对应年份的第一天，FTE 补充为 1
 *          - 新 position 对应的 sowPosition 的 FTE 按照比例分配
 *      2. 如果 invalidDate !== 对应年的最后一天
 *          - 则不复制该 position
 * 2. 获取目标 position 的最后一条 log，得到对应的金额、属性、HCCategory
 * 3. 然后计算新 position 对应的预算、level
 * 4. 如果 position 中存在员工，则将该员工作为 expectStaff
 * 5. 获取对应 execution sow 的分配 sowPosition，然后复制对应的 FTE，重新计算分配金额
 *
 * @param {string} positionId 岗位ID
 * @param {number} year 复制生成年份
 * @param {object} t transaction
 * @return {null}
 */
async function copyPosition (positionId, year, t) {
  let $position = await models.position.findById(positionId, {
    transaction: t,
    attributes: attrPosition,
    include: [{
      model: models.sowPosition,
      where: {status: 2},
      include: [{
        model: models.sow,
        attributes: ['id', 'name', 'year', 'sowType']
      }]
    }, {
      model: models.positionLog,
      attributes: attrPositionLog,
      separate: true,
      limit: 1,
      order: [['entryDate', 'DESC'], ['year', 'DESC']]
    }]
  })
  let $positionLog = $position.positionLogs[0]
  let $stdPosDetail = await models.stdPosDetail.findOne({
    transaction: t,
    where: {
      stdPosId: $positionLog.stdPosId,
      skillLevel: $positionLog.skillLevel,
      year: year - 1
    },
    include: [{
      model: models.stdPosPrice
    }]
  })

  if (!$stdPosDetail) throw new Error(`StdPos - ${$positionLog.stdPosId}, SkillLevel - ${$positionLog.skillLevel}, Year - ${year} 对应的 stdPosDetail 不存在`)

  let newPosition = await getNewPosition($position, year, $positionLog, $stdPosDetail, t)
  let newSowPositions = await getNewSowPositions($position.sowPositions, year, newPosition, $position, t)

  return {newPosition, newSowPositions}
}

/**
 * 根据相关数据，生成新的 postion
 * 1. 获取基础信息
 * 2. 判断 positionLog 是否存在员工，然后计算预算
 *      - 存在，则用 positionLog 对应的员工计算预算
 *      - 不存在，则用新的 stdposDetail 来计算预算
 * 3. 计算 sowLevel
 */

async function getNewPosition ($position, year, $positionLog, $stdPosDetail, t) {
  let newPosition = {
    id: uuidv1(),
    name: $position.name,
    year,
    expectStaffId: $positionLog.staffId,
    HCCategory: $position.HCCategory,
    stdPosDetailId: $stdPosDetail.id,
    validDate: `${year}-01-01`,
    invalidDate: `${year}-12-31`,
    FTE: 1
  }
  let logAttrs = [
    'titleId', 'companyId', 'fordFunctionId', 'officeId', 'currencyId',
    'teamId', 'stdPosId', 'skillLevel', 'location',
    'seqNo'
  ]

  logAttrs.forEach(attr => newPosition[attr] = $positionLog[attr])

  let option = {}

  if (newPosition.expectStaffId) {
    option = {
      type: budgetType.staff,
      expectStaffId: newPosition.expectStaffId,
      year: year - 1,
      currencyId: newPosition.currencyId
    }
  }
  else {
    option = {
      type: budgetType.stdPos,
      stdPosDetailId: newPosition.stdPosDetailId
    }
  }

  let budget = await queryPositionBudget(option)

  newPosition = Object.assign(newPosition, budget)

  newPosition.sowLevel = await querySowLevel(newPosition.directComp, newPosition.currencyId, newPosition.year - 1, t)

  return newPosition
}

/**
 * 根据相关数据，生成新的 sowPosition
 *
 * @return  newSowPositions
 *            - sowId
 *            - sow
 *                - sowType
 *            - positionId
 *            - FTE
 *            - net
 *            - tax
 *            - gross
 *            - incentive
 *            - grandTotal
 */

async function getNewSowPositions ($oldSowPositions, year, newPosition, $position, t) {
  let newSowPositions = $oldSowPositions.map($sowPosition => ({
    sowName: $sowPosition.sow.name.replace($sowPosition.sow.year, year),
    positionId: newPosition.id,
    FTE: $sowPosition.FTE,
    status: $sowPosition.sow.sowType === clientType.Sold ? 0 : 1
  }))

  if ($position.FTE !== 1) {
    if ($position.invalidDate !== `${$position.year}-12-31`) return null

    let sumFTE = 0

    newSowPositions.forEach((newSowPosition, index) => {
      if (index === newSowPositions.length - 1) newSowPosition.FTE = NP.minus(newPosition.FTE, sumFTE)
      else {
        newSowPosition.FTE = NP.times(NP.divide(newSowPosition.FTE, $position.FTE), newPosition.FTE).simpleFixed(2)
        sumFTE = NP.plus(sumFTE, newSowPosition.FTE)
      }
    })
  }

  let $sows = await models.sow.findAll({
    transaction: t,
    where: {
      name: {$in: newSowPositions.map(newSowPosition => newSowPosition.sowName)},
      year
    }
  })

  for (let i = 0; i < newSowPositions.length; i++) {
    let newSowPosition = newSowPositions[i]

    for (let j = 0; j < $sows.length; j++) {
      if (newSowPosition.sowName === $sows[j].name) {
        newSowPosition.sowId = $sows[j].id
        delete newSowPosition.sowName


        let attrs = ['net', 'tax', 'gross', 'budgetIncentive', 'officeId']
        let options = {
          FTE: newSowPosition.FTE,
          clientId: $sows[j].clientId
        }

        attrs.forEach(attr => options[attr] = newPosition[attr])

        let sowPositionCost = await runGetClientCost(options)

        newSowPosition = Object.assign(newSowPosition, sowPositionCost)
        break
      }
    }
  }

  return newSowPositions
}


