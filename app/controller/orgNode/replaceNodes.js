const
  {validate, success, fail} = require('../../helper'),
  {replaceNodes} = require('../../service/orgNode'),
  {sequelize} = require('../../../models');

module.exports = (req, res) => {
  const rule = {
    staffId: {type: 'string', required: true},
    nodeId: {type: 'number', required: true}
  }

  let args = validate(res, rule, req.body)

  if (!args) return

  let run = async t => {
    await replaceNodes(args, t);
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res))
}
