const
  {success, fail} = require('../../helper'),
  {staffsAndOrgNodesList} = require('../../service/orgNode'),
  {sequelize} = require('../../../models');

module.exports = (req, res) => {

  let run = async t => {
    let list = await staffsAndOrgNodesList(t);

    return list;
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res))
}
