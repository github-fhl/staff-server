const
  {ApiDialect} = require('api-dialect'),
  moment = require('moment'),
  {getCommonId} = require('../commonFn')

exports.getProductionName = (req, res) => {
  let api = new ApiDialect(req, res)

  getCommonId(moment(), 'id', 'production')
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
