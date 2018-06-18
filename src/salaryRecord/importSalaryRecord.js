const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {uploadPath} = require('config'),
  {costType, salaryDistributionType, costDistributionType, staffType} = require('config').get('args'),
  {Left} = require('config').get('flowCfg').staffStatus,
  NP = require('number-precision'),
  moment = require('moment'),
  Excel = require('exceljs')

function importSalaryRecord (req, res) {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('filePath', true)
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => run(api.args, t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
exports.importSalaryRecord = importSalaryRecord


/**
 * 1. 获取员工薪资信息
 * 1. 对员工进行校验
 * 1. 允许对某月某人的 salaryRecord 进行覆盖操作
 * 2. 录入的信息包括
 *      - staffName
 *      - currency
 *      - 各种 salaryType 的金额
 *      - //todo record 的分配，选择类别，录入名称
 * 3. 默认生成对应的 record 分配
 */

async function run (args, t) {
  let staffInfos = await getStaffInfos(args.filePath)

  for (let staffInfo of staffInfos) {
    await checkStaffInfo(staffInfo, t)
    await insertSalaryRecord(staffInfo, t)
  }
}

/**
 * 根据 excel 获取员工信息，并将金额 * 100
 * 返回
 *    - staffInfos
 *        - staffName
 *        - date  YYYY-MM
 *        - currencyId
 *        - salaryDistributions
 *            - salaryTypeId
 *            - amount
 *        - amount
 *
 * @param filePath
 */

async function getStaffInfos (filePath) {
  let
    indexes = {
      staffName: 3,
      year: 4,
      month: 5,
      currencyId: 6,
    },
    staffInfos = []

  let workbook = new Excel.Workbook()

  await workbook.xlsx.readFile(`${uploadPath}/${filePath}`)

  let worksheet = workbook.getWorksheet('工资')

  worksheet.eachRow((row, rowNumber) => {

    if (rowNumber === 2) {
      row.eachCell((cell, cellNumber) => {
        if (cellNumber > indexes.currencyId) indexes[cell.value] = cellNumber
      })
    }
    else if (row.getCell(2).value) {
      let staffInfo = {
        salaryDistributions: [],
        amount: 0
      }

      for (let key in indexes) {
        if (indexes[key] <= indexes.currencyId) {
          staffInfo[key] = row.getCell(indexes[key]).value
        }
        else {
          if (row.getCell(indexes[key]).value) {
            let amount = NP.times(row.getCell(indexes[key]).value, 100)

            staffInfo.salaryDistributions.push({
              salaryTypeId: key,
              amount
            })
            staffInfo.amount = NP.plus(staffInfo.amount, amount)
          }
        }
      }

      staffInfo.date = moment(`${staffInfo.year}-${parseInt(staffInfo.month).prefix0(2)}`).format('YYYY-MM')
      delete staffInfo.year
      delete staffInfo.month
      staffInfos.push(staffInfo)
    }
  })

  return staffInfos
}


/**
 * 校验
 * 1. 校验员工不能为 Left
 */

async function checkStaffInfo (staffInfo, t) {
  let $staff = await models.staff.findOne({
    transaction: t,
    where: {name: staffInfo.staffName}
  })

  if (!$staff) throw new Error(`员工名 ${staffInfo.staffName} 不存在`)
  if ($staff.flowStatus === Left) throw new Error(`员工 ${staffInfo.staffName} 已离职`)
}


/**
 * 录入 salaryRecord 数据
 * 1. 检查是否存在对应月的 salaryRecord
 *    - 存在则删除旧有 salaryRecord、salaryDistribution、costDistribution 数据
 * 2. 创建 salaryRecord
 * 3. 创建 salaryDistribution
 * 4. 创建 costDistribution
 */

async function insertSalaryRecord (staffInfo, t) {
  let $staff = await models.staff.findOne({
    transaction: t,
    where: {name: staffInfo.staffName},
    include: [{
      model: models.salaryRecord,
      where: {date: staffInfo.date},
      required: false
    }]
  })

  if ($staff.salaryRecords.length !== 0) await destroySalaryRecord($staff.salaryRecords[0].id, t)

  let $salaryRecord = await models.salaryRecord.create({
    staffId: $staff.id,
    date: staffInfo.date,
    currencyId: staffInfo.currencyId,
    amount: staffInfo.amount,
  }, {transaction: t})
  let salaryDistributions = staffInfo.salaryDistributions.map(salaryDistribution => ({
    ...salaryDistribution,
    type: salaryDistributionType.salaryRecord,
    commonId: $salaryRecord.id
  }))

  await models.salaryDistribution.bulkCreate(salaryDistributions, {transaction: t})

  if ($staff.staffType === staffType.Regular) await regularCreateCostDistribution($staff.id, $salaryRecord.id, $salaryRecord.amount, t)
  else await freelancerCreateCostDistribution($staff.id, $salaryRecord.date, $salaryRecord.id, $salaryRecord.amount, t)
}

/**
 * 删除 salaryRecord、salaryDistribution、costDistribution
 */

async function destroySalaryRecord (salaryRecordId, t) {
  await models.costDistribution.destroy({
    transaction: t,
    where: {
      costType: costType.salaryRecord,
      costCenterId: salaryRecordId
    }
  })

  await models.salaryDistribution.destroy({
    transaction: t,
    where: {
      type: salaryDistributionType.salaryRecord,
      commonId: salaryRecordId
    }
  })

  await models.salaryRecord.destroy({
    transaction: t,
    where: {
      id: salaryRecordId
    }
  })
}

/**
 * 正式员工，创建 costDistribution
 * 1. 查询对应的 positionLog
 * 2. 100% 是该 log
 */

async function regularCreateCostDistribution (staffId, salaryRecordId, amount, t) {
  let $staff = await models.staff.findById(staffId, {
    transaction: t,
    include: [{
      model: models.positionLog,
      attributes: ['id', 'positionId', 'staffId'],
      separate: true,
      order: [['entryDate', 'DESC'], ['year', 'DESC']],
      limit: 1
    }]
  })
  let costDistribution = {
    costType: costType.salaryRecord,
    costCenterId: salaryRecordId,
    type: costDistributionType.position,
    commonId: $staff.positionLogs[0].positionId,
    percentage: 1,
    amount
  }

  await models.costDistribution.create(costDistribution, {transaction: t})
}


/**
 * 临时员工，创建 costDistribution
 * 1. 查询对应的 estimateSalary（可能有多条）
 * 2. 得到对应的 freelancerContract，及其分配比
 * 3. 计算汇总的月份分配比
 * 4. 最后一条数据根据前面数据减法得到
 */

async function freelancerCreateCostDistribution (staffId, date, salaryRecordId, amount, t) {
  let $estimateSalaries = await models.estimateSalary.findAll({
    transaction: t,
    where: {
      staffId,
      month: date
    },
    include: [{
      model: models.freelancerContract,
      include: [{
        model: models.costDistribution
      }]
    }]
  })

  let
    estimateAmount = 0,

    /**
     * estimateCost
     *    - {commonId}-{type}
     *        - commonId
     *        - amount
     *        - type
     */

    estimateCost = {}

  $estimateSalaries.forEach($estimateSalary => {
    estimateAmount = NP.plus(estimateAmount, $estimateSalary.gross)

    $estimateSalary.freelancerContract.costDistributions.forEach($costDistribution => {
      let key = `${$costDistribution.commonId}-${$costDistribution.type}`

      if (!estimateCost[key]) estimateCost[key] = {
        amount: 0,
        type: $costDistribution.type,
        commonId: $costDistribution.commonId
      }

      estimateCost[key].amount = NP.plus(
        estimateCost[key].amount,
        NP.times($estimateSalary.gross, $costDistribution.percentage).simpleFixed(0)
      )
    })
  })

  let costDistributions = []

  for (let key in estimateCost) {
    let
      percentage = NP.divide(estimateCost[key].amount, estimateAmount).simpleFixed(2),
      actualAmount = NP.plus(amount, percentage)

    costDistributions.push({
      costType: costType.salaryRecord,
      costCenterId: salaryRecordId,
      type: estimateCost[key].type,
      commonId: estimateCost[key].commonId,
      amount: actualAmount,
      percentage,
    })
  }


  let
    tempAmount = 0,
    tempPercentage = 0

  for (let i = 0; i < costDistributions.length - 1; i++) {
    tempAmount = NP.plus(tempAmount, costDistributions[i].amount)
    tempPercentage = NP.plus(tempPercentage, costDistributions[i].percentage)
  }

  costDistributions[costDistributions.length - 1] = {
    ...costDistributions[costDistributions.length - 1],
    amount: NP.minus(amount, tempAmount),
    percentage: NP.minus(1, tempPercentage)
  }

  await models.costDistribution.bulkCreate(costDistributions, {transaction: t})
}
