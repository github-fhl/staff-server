const
  {validate, success, fail} = require('../../helper'),
  {update} = require('../../service/fordFunction'),
  {sequelize} = require('../../../models')

module.exports = (req, res) => {
  const rule = {
    id: {type: 'string', required: true},
    name: {type: 'string', required: true}
  }

  let args = validate(res, rule, req.params, req.body)

  if (!args) return

  let run = async t => {
    await update(args, t)
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res))
}
