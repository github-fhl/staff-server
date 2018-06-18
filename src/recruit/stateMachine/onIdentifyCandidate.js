/**
 * 确认候选人时，需要保证对应的候选人名称存在
 */

function onIdentifyCandidate (action) {
  if (!this.$recruit.staffName) throw new Error('需要录入候选人')
  return this
}
module.exports = onIdentifyCandidate
