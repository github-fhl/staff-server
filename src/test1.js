const
  {ApiDialect} = require('api-dialect'),
  {sequelize} = require('../models/index'),
  {destroyEstimateSalary} = require('./estimateSalary/destroy')


exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
  ]

  if (!api.setArgs(args)) return


  let run = async t => {
    let result = await destroyEstimateSalary('freelancer-01-989b-11e7-a8d6-2357-01', '2018-08', t)

    return result
  }


  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}
