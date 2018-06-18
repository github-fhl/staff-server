const
  {testMigratePositionLog} = require('./testSchedule')

require('./generatorExecutionSow')
require('./updateStaffSalaryStructure')
require('./generatorInhouseFreelancer')
require('./generatorSowLevel')
require('./migratePositionLog')
require('./generatorSystemArgs')

if (process.env.NODE_ENV === 'production') {
  require('./dumpDatabase')
}

module.exports = {
  testMigratePositionLog
}

// todo 快要跨年时，需要检查当前年份存在而次年不存在的 position 中，是否还存在员工，如果存在则通知其移除
// todo 跨年时，如果仍然存在该离职而未离职的员工，且其没有对应的 position 安放，那么创建一条新的 positionLog 在 inhouse 中，然后存进去
