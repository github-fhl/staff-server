const
  {success, fail} = require('../../helper'),
  {get} = require('../../service/passThrough')

module.exports = (req, res) => {
  let run = async () => {
    let passThrough = await get();

    return passThrough;
  }

  run().then(success(res)).catch(fail(res))
}
