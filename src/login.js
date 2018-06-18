const
  {ApiDialect, Arg} = require('api-dialect'),
  {getPermissions} = require('../components/passport'),
  unLogin = 0

exports.login = (req, res) => {
  let api = new ApiDialect(req, res)

  getPermissions(req)
    .then(() => {
      api.setResponse(req.user).send({remove: ['password']})
    })
    .catch(err => api.error(err))
}

exports.logout = (req, res) => {
  req.logout()
  res.json({
    msg: '登出成功',
    status: 'status'
  })
}

exports.getUsrInfo = (req, res) => {
  let api = new ApiDialect(req, res)

  if (!req.user) {
    api.error(new Error('请登录'))
    return
  }

  getPermissions(req)
    .then(() => {
      api.setResponse(req.user).send({remove: ['password']})
    })
    .catch(err => api.error(err))
}

exports.handler = (req, res) => {
  let api = new ApiDialect(req, res)

  api.setArgs([new Arg('type')])

  switch (api.args.type) {
    case 'login':
      return api.error(new Error(req.flash('error')[0]))
    case 'notLogin':
      return api.error(new Error(unLogin))
    default:
      return api.error(new Error(0))
  }
}
