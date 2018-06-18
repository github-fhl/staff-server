const
  {getList, importSalaryRecord} = require('../src/salaryRecord'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/salaryRecords')
    .get(can('read', 'salaryRecord'), getList)

  router.route('/importSalaryRecords')
    .put(can('import', 'salaryRecord'), importSalaryRecord)

}
