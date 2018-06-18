const
  {success, fail} = require('../../helper'),
  {getLeaders} = require('../../service/orgNode');

module.exports = (req, res) => {

  let run = async () => {
    let leaders = await getLeaders();

    return leaders;
  }

  run().then(success(res)).catch(fail(res))
}
