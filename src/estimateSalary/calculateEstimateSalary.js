const
  {ApiDialect, Arg} = require('api-dialect'),
  NP = require('number-precision'),
  {accountType, accountTypeTax, freelancerSalaryType, taxType} = require('config').get('args'),
  {weekDaysInMonth} = require('../../components/widgets/project')

exports.calculateEstimateSalary = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('salaryTypeId', true),
    new Arg('taxType', true),
    new Arg('accountType', true),
    new Arg('basicSalary', true),
    new Arg('workdays', true),
    new Arg('month', true),
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 * 获取招聘、延期 Freelancer 的 estimateSalary
 * 1. 获取未考虑税的金额 basicAmount
 *    1. 日薪：basicAmount = basicSalary * workdays
 *    2. 月薪：basicAmount = basicSalary * (workdays / 22)
 *    3. 一口价：basicAmount = basicSalary
 * 2. 根据 salaryType 、 taxType、accountType、basicAmount 计算得到 税前税后金额
 *
 */

async function run (args, t) {
  args.workdays = parseInt(args.workdays)

  let basicAmount = getBasicAmount(args.salaryTypeId, args.basicSalary, args.workdays, args.month)
  let result = getNetAndGross(args.taxType, args.accountType, basicAmount)

  return {
    ...result,
    basicAmount
  }
}

/**
 * 获取未考虑税的金额 basicAmount
 *    1. 日薪：basicAmount = basicSalary * workdays
 *    2. 月薪：basicAmount = basicSalary * (workdays / 每月工作日)
 *    3. 一口价：basicAmount = basicSalary
 */

function getBasicAmount (salaryTypeId, basicSalary, workdays, month) {
  let basicAmount = 0

  if (salaryTypeId === freelancerSalaryType['Freelancer Daily Salary']) {
    basicAmount = NP.times(basicSalary, workdays).simpleFixed(0)
  }
  if (salaryTypeId === freelancerSalaryType['Freelancer Monthly Salary']) {
    basicAmount = NP.times(basicSalary, NP.divide(workdays, weekDaysInMonth(month))).simpleFixed(0)
  }
  if (salaryTypeId === freelancerSalaryType['Freelancer One Time Salary']) {
    basicAmount = basicSalary
  }

  return basicAmount
}
exports.getBasicAmount = getBasicAmount


/**
 * 获取 net、gross
 * 需要根据是否为个人劳务报酬进行区分
 *
 * @param salaryType
 * @param taxType
 * @param accountType
 * @param basicAmount
 * @return {Promise<void>}
 */

function getNetAndGross (selectTaxType, selectAccountType, basicAmount) {
  let result

  if (selectAccountType !== accountType.PersonalAccount) {
    result = getNetAndGrossByUnPersonalAccount(selectTaxType, selectAccountType, basicAmount)
  }
  else {
    result = getNetAndGrossByPersonalAccount(selectTaxType, basicAmount)
  }

  return result
}


/**
 * 获取非劳务报酬的 net、gross
 * 1. taxType 为税前
 *    1. net = basicAmount
 *    2. gross = net * (1 + taxRate)
 * 2. taxType 为税后
 *    1. gross = basicAmount
 *    2. net = gross / (1 + taxRate)
 *
 * @return {{net: number, gross: number}}
 */

function getNetAndGrossByUnPersonalAccount (selectTaxType, selectAccountType, basicAmount) {
  let
    net = 0,
    gross = 0

  if (selectTaxType === taxType.AfterTax) {
    net = basicAmount
    gross = NP.times(net, NP.plus(1, accountTypeTax[selectAccountType]))
  }
  else {
    gross = basicAmount
    net = NP.divide(gross, NP.plus(1, accountTypeTax[selectAccountType]))
  }

  return {
    net, gross
  }
}

/**
 * 获取劳务报酬的  net、gross
 * 1. 扣税前
 *    1. 扣税前金额 <= 4000，免征额 = 800
 *    2. 扣税前金额 > 4000，免征额 = 扣税前金额 * 0.2
 *    3. 应税收入 = 扣税前金额 - 免征额
 *    4. 个人所得税 = 应税收入 * 税率 - 速算扣除数
 * 2. 扣税后
 *    1. 扣税后金额 <= 3360 ，免征额 = 800，税率 = 0.2，速算扣除数 = 0
 *    2. 扣税后金额 <= 21000，免征额率 = 0.2，速算扣除数 = 0，税率 = 0.2
 *    3. 扣税后金额 <= 49500，免征额率 = 0.2，速算扣除数 = 2000，税率 = 0.3
 *    4. 扣税后金额 > 49500，免征额率 = 0.2，速算扣除数 = 7000，税率 = 0.4
 */

let
  exemptionRate = 0.2,
  preTaxRates = [
    {
      min: 0,
      taxRate: 0.2,
      deduction: 0
    },
    {
      min: 2000000,
      taxRate: 0.3,
      deduction: 200000
    },
    {
      min: 5000000,
      taxRate: 0.4,
      deduction: 700000
    }
  ],
  afterTaxRates = [
    {
      min: 336000,
      taxRate: 0.2,
      deduction: 0
    },
    {
      min: 2100000,
      taxRate: 0.3,
      deduction: 200000
    },
    {
      min: 4950000,
      taxRate: 0.4,
      deduction: 700000
    }
  ]


function getNetAndGrossByPersonalAccount (selectTaxType, basicAmount) {
  let net, gross

  if (selectTaxType === taxType.PreTax) {
    gross = basicAmount
    let exemption = gross <= 400000 ? 80000 : NP.times(gross, exemptionRate).simpleFixed(0)
    let toTaxAmount = NP.minus(gross, exemption).simpleFixed(0)
    let {taxRate, deduction} = preTaxRates[0]

    for (let preTaxRate of preTaxRates) {
      if (gross > preTaxRate.min) {
        taxRate = preTaxRate.taxRate
        deduction = preTaxRate.deduction
      }
    }
    net = NP.minus(gross, NP.minus(NP.times(toTaxAmount, taxRate), deduction)).simpleFixed(0)
  }
  else {
    net = basicAmount

    let {taxRate, deduction} = afterTaxRates[0]

    for (let afterTaxRate of afterTaxRates) {
      if (net > afterTaxRate.min) {
        taxRate = afterTaxRate.taxRate
        deduction = afterTaxRate.deduction
      }
    }

    if (net <= 336000) {
      gross = NP.divide(NP.minus(net, NP.times(taxRate, 80000), deduction), NP.minus(1, taxRate)).simpleFixed(0)
    }
    else {
      gross = NP.divide(NP.minus(net, deduction), NP.minus(1, NP.times(0.8, taxRate))).simpleFixed(0)
    }
  }

  return {net, gross}
}

