const
  Project = require('../components/widgets').Project,
  path = require('path'),
  {can} = require('../components/rbac')

const r = Project.getFiles(path.resolve(__dirname, '../src/systems'))

module.exports = router => {

  router.route('/companys')
    .get(can('read', 'setting'), r.company.getList)
    .post(can('update', 'setting'), r.company.new)

  router.route('/companys/:id')
    .get(can('read', 'setting'), r.company.get)
    .put(can('update', 'setting'), r.company.update)

  router.route('/socialTaxs')
    .get(can('read', 'setting'), r.company.getSocialTax)

  router.route('/companyDetails')
    .post(can('update', 'setting'), r.companyDetail.new)

  router.route('/companyDetails/:id')
    .put(can('update', 'setting'), r.companyDetail.update)

  router.route('/clients')
    .get(can('read', 'setting'), r.client.getList)
    .post(can('update', 'setting'), r.client.new)

  router.route('/clients/:id')
    .get(can('read', 'setting'), r.client.get)
    .put(can('update', 'setting'), r.client.update)

  router.route('/teams')
    .get(can('read', 'setting'), r.team.getList)
    .post(can('update', 'setting'), r.team.new)

  router.route('/teams/:id')
    .put(can('update', 'setting'), r.team.update)

  router.route('/offices')
    .get(can('read', 'setting'), r.office.getList)
    .post(can('update', 'setting'), r.office.new)

  router.route('/offices/:id')
    .get(can('read', 'setting'), r.office.get)
    .put(can('update', 'setting'), r.office.update)

  router.route('/officeDetails')
    .post(can('update', 'setting'), r.officeDetail.new)

  router.route('/officeDetails/:id')
    .put(can('update', 'setting'), r.officeDetail.update)

  router.route('/fordFunctions')
    .get(can('read', 'setting'), r.fordFunction.getList)
    .post(can('update', 'setting'), r.fordFunction.new)

  router.route('/fordFunctions/:id')
    .get(can('read', 'setting'), r.fordFunction.get)
    .delete(can('update', 'setting'), r.fordFunction.delete)
    .put(can('update', 'setting'), r.fordFunction.enable)

  router.route('/salaryTypes')
    .get(can('read', 'setting'), r.salaryType.getList)
    .post(can('update', 'setting'), r.salaryType.new)

  router.route('/salaryTypes/index')
    .put(can('update', 'setting'), r.salaryType.updateIndex)

  router.route('/salaryTypes/:id')
    .get(can('read', 'setting'), r.salaryType.get)

  router.route('/currencys')
    .get(can('read', 'setting'), r.currency.getList)
    .post(can('update', 'setting'), r.currency.new)

  router.route('/currencys/:id')
    .get(can('read', 'setting'), r.currency.get)

  router.route('/currencyDetails')
    .post(can('update', 'setting'), r.currencyDetail.new)

  router.route('/currencyDetails/:id')
    .put(can('update', 'setting'), r.currencyDetail.update)

  router.route('/stdPoss')
    .get(can('read', 'setting'), r.stdPos.getList)
    .post(can('update', 'setting'), r.stdPos.new)

  router.route('/stdPoss/:id')
    .get(can('read', 'setting'), r.stdPos.get)

  router.route('/stdPosDetails')
    .post(can('update', 'setting'), r.stdPosDetail.new)

  router.route('/stdPosDetails/:id')
    .put(can('update', 'setting'), r.stdPosDetail.update)
}
