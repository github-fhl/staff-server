const
  {validate, success, fail} = require('../../helper'),
  {draft} = require('../../service/orgNode'),
  {sequelize} = require('../../../models');

module.exports = (req, res) => {
  const rule = {
    previousPosition: {type: 'array', required: true},
    targetPosition: {type: 'number', required: true},
    dropType: {type: 'number', required: true}
  }

  let args = validate(res, rule, req.body)

  if (!args) return

  let run = async t => {
    args.previousPosition = args.previousPosition[0];
    let orgNodeList = await draft(args, t);

    return orgNodeList;
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res))
}
