/**
 * 1. 判断调用接口用户是否拥有该权限
 *
 * @param {string} operation 操作方法
 * @param {string} object 操作对象
 * @return {function}
 */
exports.can = (operation, object) =>
  (req, res, next) => {
    let pass = false
    const newRBAC = require('./buildRBACArgs').getRBAC()

    if (req.user && req.user.roles.length !== 0) {
      req.user.roles.forEach(role => {
        newRBAC.can(role.id, operation, object, (err, can) => {
          if (err) {
            throw err
          }
          if (can) {
            pass = true
          }
        })
      })
    }

    if (pass) {
      return next()
    }

    return req.user ?
      res.json({
        status: 'failed',
        msg: '没有权限'
      }) :
      res.json({
        status: 'failed',
        msg: '请登录'
      })
  }
