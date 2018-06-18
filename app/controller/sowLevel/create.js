const
  {helperPath, modelPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {sequelize} = require(modelPath),
  {create} = require('../../service/sowLevel'),
  {updateSowLevel} = require('../../service/position'),
  {updateLevel} = require('../../service/sow')

module.exports = (req, res) => {

  const rule = {
    year: 'number', // sowLevel 的创建年份，比 sow 的年份少一年
  }

  let args = validate(res, rule, req.body)

  if (!args) return

  let run = async t => {
    await create(args.year, t)
    await updateSowLevel(args.year + 1, t)
    await updateLevel(args.year + 1, t)
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res))
}
