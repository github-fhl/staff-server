const
  util = require('util'),
  readdir = util.promisify(require('fs').readdir),
  {databaseFilesPath} = require('config'),
  {ApiDialect} = require('api-dialect')

function getList (req, res) {

  let api = new ApiDialect(req, res)

  run()
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
exports.getList = getList

async function run () {
  let results = await readdir(databaseFilesPath, 'utf8')

  results.reverse()
  return results
}
