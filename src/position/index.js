const
  {queryPositionBudget} = require('./mixedFn'),
  {getFTE} = require('./pureFn'),
  {get} = require('./get'),
  {getList} = require('./getList'),
  {create} = require('./create'),
  {getBudget} = require('./getBudget'),
  {getPositionName} = require('./getPositionName'),
  {getSowLevel, querySowLevel} = require('./getSowLevel'),
  {getHCCategory} = require('./getHCCategory'),
  {updateRemark} = require('./update')

module.exports = {
  get,
  getList,

  create,

  getPositionName,

  getSowLevel,
  querySowLevel,

  getHCCategory,

  getBudget,

  updateRemark,

  queryPositionBudget,

  getFTE
}
