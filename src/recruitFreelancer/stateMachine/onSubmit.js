function onSubmit (action) {
  let keys = ['entryDate', 'leaveDate', 'staffName', 'freelancerEstimateSalaries', 'freelancerCostDistributions', 'amount']

  for (let key of keys) {
    if (!this.$recruit[key]) throw new Error(`申请单欠缺 ${key} 字段，无法提交`)
  }
  return this
}
module.exports = onSubmit
