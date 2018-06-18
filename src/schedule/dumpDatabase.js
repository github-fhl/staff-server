const
  schedule = require('node-schedule'),
  moment = require('moment'),
  {dumpDatabaseRule} = require('./rules'),
  {execDumpDatabase} = require('../database/dumpDatabase')

exports.dumpDatabase = schedule.scheduleJob(dumpDatabaseRule, () => {
  let fileName = `Staff ${moment().format('YYYY-MM-DD HH:mm:ss')}`

  execDumpDatabase(fileName)
    .then(() => console.log(`数据库备份执行完毕 - ${fileName}`))
    .catch(err => console.error(err))
})
