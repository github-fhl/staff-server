const
  login = require('../src/login')

module.exports = (router, passport) => {

  // 登录
  router.route('/login')
    .put(passport.authenticate('local', {
      failureRedirect: '/api/error/login',
      failureFlash: true
    }), login.login)

  // 登录失败
  router.route('/error/:type')
    .put(login.handler)
  router.route('/api/error/:type')
    .put(login.handler)

  // 登出
  router.route('/logout')
    .put(login.logout)

  // 获取当前用户信息
  router.route('/usrInfo')
    .get(login.getUsrInfo)
}
