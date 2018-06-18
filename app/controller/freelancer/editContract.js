const
  {validate, success, fail} = require('../../helper'),
  {editContract} = require('../../service/freelancer')

module.exports = (req, res) => {
  const rule = {
    freelancerContract: {type: 'string', required: true},
    contractFile: {type: 'string', required: true}
  }
  let args = validate(res, rule, req.body)

  if (!args) return

  let run = async () => {
    await editContract(args);
  }

  run().then(success(res)).catch(fail(res))
}
