const
  {validate, success, fail} = require('../../helper'),
  {getNameHistory} = require('../../service/fordFunction')

module.exports = (req, res) => {
  const rule = {
    id: {type: 'string', required: true},
  }

  let args = validate(res, rule, req.params)

  if (!args) return

  let run = async () => {
    let nameHistory = await getNameHistory(args)

    return nameHistory;
  }

  run().then(success(res)).catch(fail(res))
}
