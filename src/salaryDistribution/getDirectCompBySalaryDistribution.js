const
  cfg = require('config').get('args'),
  {salaryType, salaryCategory} = cfg,
  {Local} = cfg.location

/**
 * 通过 salaryDistribution 计算得到对应的 directComp
 *
 * directComp = (monthly salary + salaryIncrease) * 13/12 + sum(cola) * 12 + sum(bonus)
 *
 * @param {array} salaryDistributions 薪资
 *                  - salaryTypeId
 *                  - amount
 *                  - salaryType
 *                      - category
 * @param {string} location 对应员工、positionLog 国内还是国外
 * @return {number}
 */
function getDirectCompBySalaryDistribution (salaryDistributions, location) {
  let
    monthlySalary = 0,
    salaryIncrease = 0,
    cola = 0,
    bonus = 0

  salaryDistributions.forEach(salaryDistribution => {
    if (salaryDistribution.salaryTypeId === salaryType['Monthly Salary']) monthlySalary = salaryDistribution.amount
    if (salaryDistribution.salaryTypeId === salaryType['13th Salary']) salaryIncrease = salaryDistribution.amount
    if (salaryDistribution.salaryType.category === salaryCategory.Cola) cola += salaryDistribution.amount
    if (salaryDistribution.salaryType.category === salaryCategory.Bonus) cola += salaryDistribution.amount
  })

  let times = location === Local ? 13 : 12
  let directComp = (monthlySalary + salaryIncrease) * times + cola * 12 + bonus

  return directComp
}

exports.getDirectCompBySalaryDistribution = getDirectCompBySalaryDistribution
