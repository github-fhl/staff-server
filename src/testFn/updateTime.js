const
  util = require('util'),
  exec = util.promisify(require('child_process').exec),
  moment = require('moment'),
  {ApiDialect, Arg} = require('api-dialect')

exports.updateTime = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('time', true)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

async function run (args) {
  let time = moment(args.time)

  await exec(`date -s ${time.format('YYYY/MM/DD')}`)
  await exec(`date -s ${time.format('HH:mm:ss')}`)

  return {
    nowTime: moment().format('YYYY-MM-DD HH:mm:ss')
  }
}
