const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  {salaryDistributionType, distributeType} = require('config').get('args')

exports.createSalaryStructure = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('staffId', true),
    new Arg('validDate', true),
    new Arg('salaryDistributions', true),
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(async t => {
    await checkSalaryStructure(api.args, api.args.salaryDistributions, t)
    await insertSalaryStructure(api.args, api.args.salaryDistributions, t)
  })
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 * 校验编辑后的monthly salary是否等于编辑前，ByMonth类型,ByYear类型的总金额是否分别等于编辑前
 * 第一步：根据staffId，valiDate找到一条salaryStructure记录
 * 第二步：根据salaryStructure找到对应的SalaryDustribution记录
 * 第三步：遍历编辑前的salaryDustribution和编辑后的salaryDustributionByMonth和ByYear类型的总和判断编辑前后是否相等
 * @param salaryStructure
 * @param salaryDustributions
 * @param t
 * @returns {Promise<void>}
 */

async function checkSalaryStructure (salaryStructure, salaryDustributions, t) {
  let [oldMonthlySum, newMonthlySum, oldYearSum, newYearSum, oldMonthlySalary, newMonthlySalary] = [0, 0, 0, 0, 0, 0]

  let $oldSalaryStructures = await models.salaryStructure.findAll({
    transaction: t,
    where: {
      staffId: salaryStructure.staffId,
      validDate: salaryStructure.validDate
    }
  })

  if ($oldSalaryStructures.length === 0) {
    throw new Error('获取SalaryDustributions失败');
  }
  let $oldSalaryDustributions = await models.salaryDistribution.findAll({where: {commonId: $oldSalaryStructures[0].id}})
  let $salaryTypes = await models.salaryType.findAll({where: {status: 1}, transaction: t})

  $oldSalaryDustributions.forEach($oldSalaryDustribution => {
    if ($oldSalaryDustribution.salaryTypeId === 'Monthly Salary') oldMonthlySalary = $oldSalaryDustribution.amount
    $salaryTypes.forEach($salaryType => {
      if ($oldSalaryDustribution.salaryTypeId === $salaryType.id) {
        if ($salaryType.distributeType === distributeType.ByMonth) {
          oldMonthlySum += $oldSalaryDustribution.amount
        } else if ($salaryType.distributeType === distributeType.ByYear) {
          oldYearSum += $oldSalaryDustribution.amount
        }
      }
    })
  })
  salaryDustributions.forEach(salaryDustribution => {
    if (salaryDustribution.salaryTypeId === 'Monthly Salary') newMonthlySalary = salaryDustribution.amount
    $salaryTypes.forEach($salaryType => {
      if (salaryDustribution.salaryTypeId === $salaryType.id) {
        if ($salaryType.distributeType === distributeType.ByMonth) {
          newMonthlySum += salaryDustribution.amount
        } else if ($salaryType.distributeType === distributeType.ByYear) {
          newYearSum += salaryDustribution.amount
        }
      }
    })
  })
  if (oldMonthlySalary !== newMonthlySalary) {
    throw new Error('编辑后的MonthlySalary与编辑前不同')
  }
  if (newMonthlySum !== oldMonthlySum) {
    throw new Error('编辑后的ByMonth类型的总金额与编辑前不同')
  }
  if (newYearSum !== oldYearSum) {
    throw new Error('编辑后的ByYear类型的总金额与编辑前不同')
  }
}

/**
 *
 * 创建 salaryStructure
 * 1. 删除员工旧月份的 salaryStructure
 * 2. 创建 salaryStructure/salaryDistributions
 *
 * @param {object} salaryStructure salaryStructure
 *                    - staffId
 *                    - validDate
 * @param {array} salaryDistributions salaryDistributions
 *                    - salaryTypeId
 *                    - amount
 * @param {object} t transaction
 * @returns {null}
 */

async function insertSalaryStructure (salaryStructure, salaryDistributions, t) {
  let $oldSalaryStructures = await models.salaryStructure.findAll({
    transaction: t,
    where: {
      staffId: salaryStructure.staffId,
      validDate: salaryStructure.validDate
    }
  })

  if ($oldSalaryStructures.length !== 0) {
    let ids = $oldSalaryStructures.map($oldSalaryStructure => $oldSalaryStructure.id)

    await models.salaryDistribution.destroy({
      transaction: t,
      where: {
        commonId: {$in: ids}
      }
    })
    await models.salaryStructure.destroy({
      transaction: t,
      where: {
        id: {$in: ids}
      }
    })
  }

  let $staff = await models.staff.findOne({
    transaction: t,
    where: {id: salaryStructure.staffId},
    attributes: ['currencyId']
  })

  salaryStructure.currencyId = $staff.currencyId

  let $salaryStructure = await models.salaryStructure.create(salaryStructure, {transaction: t})

  let $positionLog = await models.positionLog.findAll({
    where: {staffId: salaryStructure.staffId},
    order: [['entryDate', 'desc']],
    transaction: t
  })

  if (!$positionLog) {
    throw new Error('获取positionLog失败')
  }
  await models.salaryDistribution.destroy({
    transaction: t,
    where: {
      commonId: $positionLog[0].id
    }
  })
  salaryDistributions.forEach(salaryDistribution => {
    salaryDistribution.commonId = $positionLog[0].id
    salaryDistribution.type = salaryDistributionType.positionLog
  })
  await models.salaryDistribution.bulkCreate(salaryDistributions, {transaction: t})

  salaryDistributions.forEach(salaryDistribution => {
    salaryDistribution.commonId = $salaryStructure.id
    salaryDistribution.type = salaryDistributionType.salaryStructure
  })
  await models.salaryDistribution.bulkCreate(salaryDistributions, {transaction: t})
}

exports.insertSalaryStructure = insertSalaryStructure
