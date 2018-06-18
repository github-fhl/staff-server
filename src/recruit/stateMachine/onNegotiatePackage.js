/**
 * 确认薪资时，检查对应的薪资是否已录入
 */

function onNegotiatePackage (action) {
  if (!this.$recruit.staffSalaryDistributions) throw new Error('需要录入候选人薪资')
  return this
}
module.exports = onNegotiatePackage
