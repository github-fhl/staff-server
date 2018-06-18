const
  {flow} = require('./stateMachine'),
  {getList} = require('./getList'),
  {create} = require('./create'),
  {update} = require('./update'),
  {get} = require('./get')

module.exports = {
  getList,
  create,
  update,
  flow,
  get
}
