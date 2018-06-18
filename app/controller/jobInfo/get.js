const
  {validate, success, fail} = require('../../helper'),
  {get} = require('../../service/jobInfo')

module.exports = (req, res) => {
  const rule = {id: {type: 'string', required: true}}

  let args = validate(res, rule, req.params)

  if (!args) return

  let run = async () => {
    let jobInfo = await get(args);

    return jobInfo;
  }

  run().then(success(res)).catch(fail(res))
}
