const
  {getList} = require('./getList'),
  {get} = require('./get'),
  {getProjectName} = require('./getProjectName'),
  {create} = require('./create'),
  {copy} = require('./copy'),
  {getProjectBalance} = require('./getProjectBalance'),
  {updateOfficeRate} = require('./updateOfficeRate'),
  {update} = require('./update'),
  {flow} = require('./stateMachine')

module.exports = {
  getList,
  get,
  getProjectName,
  create,
  copy,
  update,
  getProjectBalance,
  updateOfficeRate,
  flow
}
