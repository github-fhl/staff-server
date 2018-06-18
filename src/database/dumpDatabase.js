const
  util = require('util'),
  exec = util.promisify(require('child_process').exec),
  moment = require('moment'),
  {mysql, databaseFilesPath} = require('config'),
  {database, username, password} = mysql,
  {ApiDialect, Arg} = require('api-dialect')

function dumpDatabase (req, res) {

  let api = new ApiDialect(req, res)
  let args = [
    new Arg('remark', false)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
exports.dumpDatabase = dumpDatabase

async function run (args) {

  let fileName = `Staff ${moment().format('YYYY-MM-DD HH:mm:ss')}`

  if (args.remark) fileName += ` (${args.remark})`
  fileName += '.sql'

  await execDumpDatabase(fileName)

  return fileName
}

async function execDumpDatabase (fileName) {
  await exec(`mysqldump -u ${username} -p${password} ${database} > ${databaseFilesPath}/'${fileName}'`)
}
exports.execDumpDatabase = execDumpDatabase
