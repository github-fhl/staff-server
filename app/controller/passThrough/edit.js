const
  {success, fail} = require('../../helper'),
  {edit} = require('../../service/passThrough'),
  Parameter = require('parameter'),
  _ = require('lodash')

module.exports = (req, res) => {
  const parameter = new Parameter();
  const rule = {
    passThroughType: {type: 'array', required: true}
  }
  const args = req.body;

  let run = async () => {
    let errors = parameter.validate(rule, args)

    if (!_.isEmpty(errors)) throw new Error(`${errors[0].field} ${errors[0].message}`)
    await edit(args)
  }

  run().then(success(res)).catch(fail(res))
}
