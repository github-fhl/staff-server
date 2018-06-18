const
  {models} = require('../../../models')

module.exports = async args => {
  let $freelancerContract = await models.freelancerContract.findOne({where: {id: args.freelancerContract}})

  if (!$freelancerContract) {
    throw new Error('freelancerContract不存在')
  }
  await $freelancerContract.update({contractFile: args.contractFile})
}
