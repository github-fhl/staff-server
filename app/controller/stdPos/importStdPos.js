const
  {validate, success, fail} = require('../../helper'),
  {importStdPos} = require('../../service/stdPos'),
  {sequelize} = require('../../../models')

module.exports = (req, res) => {
  const rule = {
    filePath: {type: 'string', required: true}
  }

  let args = validate(res, rule, req.body)

  if (!args) return

  let run = async t => {
    await importStdPos(args, t);
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res))
}
