const
  {success, fail} = require('../../helper'),
  {getList} = require('../../service/orgNode'),
  {sequelize} = require('../../../models');

module.exports = (req, res) => {

  let run = async t => {
    let orgNodeList = await getList(t);

    return orgNodeList;
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res))
}
