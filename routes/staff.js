const
  {getList, get, getName, updateStaffHistory, createSalaryStructure, queryStaffName} = require('../src/staff'),
  {can} = require('../components/rbac')

module.exports = router => {

  router.route('/staffs')
    .get(can('read', 'staff'), getList)

  router.route('/staffs/:id')
    .get(can('read', 'staff'), get)

  router.route('/staffNames')
    .get(can('read', 'staff'), getName)

  router.route('/queryStaffName')
    .get(can('read', 'staff'), queryStaffName)

  router.route('/staffHistorys/:id')
    .put(can('update', 'staff'), updateStaffHistory)

  router.route('/salaryStructures')
    .post(can('update', 'staff'), createSalaryStructure)
}
