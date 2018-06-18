const
  {models} = require('../../../models')

module.exports = async args => {
  let $staffHistory = await models.staffHistory.findOne({where: {id: args.staffHistory}})

  if (!$staffHistory) {
    throw new Error('staffHistory不存在')
  }
  await $staffHistory.update({contractFile: args.contractFile})
}
