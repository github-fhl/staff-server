const
  util = require('util'),
  exec = util.promisify(require('child_process').exec),
  access = util.promisify(require('fs').access),
  {mysql, databaseFilesPath} = require('config'),
  {database, username, password} = mysql,
  {ApiDialect, Arg} = require('api-dialect')

function importDatabase (req, res) {

  let api = new ApiDialect(req, res)
  let args = [
    new Arg('fileName', true)
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
exports.importDatabase = importDatabase

async function run (args) {
  await access(`${databaseFilesPath}/${args.fileName}`)
  await exec(`mysql -u ${username} -p${password} ${database} < ${databaseFilesPath}/'${args.fileName}'`)
}
