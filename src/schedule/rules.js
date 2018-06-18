module.exports = {
  updateStaffSalaryStructureRule: '0 1 0 1 1 *',
  generatorSystemArgsRule: '0 3 0 1 1 *',
  generatorExecutionSowRule: '0 5 0 1 1 *',
  generatorInhouseFreelancerRule: '0 7 0 1 1 *',
  migratePositionLogRule: '0 9 0 1 1 *',
  generatorSowLevelRule: '0 1 0 30 9 *',

  // todo 正式上线时修改为每天备份一份
  dumpDatabaseRule: '0 0 * * * *',
}
