const
  {getList} = require('./getList'),
  {get} = require('./get'),
  {getName} = require('./getName'),
  {queryStaffName} = require('./queryStaffName'),
  {updateStaffHistory} = require('./updateStaffHistory'),
  {createSalaryStructure, insertSalaryStructure} = require('./salaryStructure')

module.exports = {
  getList,
  get,
  getName,
  updateStaffHistory,
  createSalaryStructure,
  insertSalaryStructure,
  queryStaffName
}
