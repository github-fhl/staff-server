const
  {ApiDialect} = require('api-dialect'),
  moment = require('moment'),
  {getCommonId} = require('../commonFn')

exports.getProjectName = (req, res) => {
  let api = new ApiDialect(req, res)

  getCommonId(moment(), 'name', 'project')
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
