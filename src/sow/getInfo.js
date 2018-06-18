const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index'),
  {getNewSowInfoForSoldMixed} = require('./getNewSowInfoForSoldMixed'),
  {getNewSowVersion} = require('./mixedFn')

let getNewSowInfo = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('targetSowId', true)
  ]

  if (!api.setArgs(receiveArgs)) return

  let run = async args => {
    let $targetSow = await models.sow.findById(args.targetSowId)
    let {sowCost} = await getNewSowInfoForSoldMixed(args.targetSowId, $targetSow.year)

    sowCost.currencyId = $targetSow.currencyId
    sowCost.name = $targetSow.name
    sowCost.version = await getNewSowVersion($targetSow.name, $targetSow.year)
    return sowCost
  }

  run(api.args)
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.getNewSowInfo = getNewSowInfo
