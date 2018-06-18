const
  {models} = require('../../../models')

module.exports = async args => {
  let $fordFunction = await models.fordFunction.findOne({where: {id: args.id}});

  if (!$fordFunction) {
    throw new Error(`${args.id}不存在`)
  }
  let $fordFunctions = await models.fordFunction.findAll({
    where: {group: $fordFunction.group},
    order: [['createdAt', 'desc']]
  })

  return {rows: $fordFunctions, count: $fordFunctions.length}
}
