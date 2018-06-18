const
  {models} = require('../../../models')

module.exports = async (args, t) => {
  let $fordFunction = await models.fordFunction.findOne({where: {id: args.id}, transaction: t});

  await models.fordFunction.update({status: 0}, {where: {group: $fordFunction.group}, transaction: t})

  await models.fordFunction.create({id: args.name, group: $fordFunction.group}, {transaction: t})
}
