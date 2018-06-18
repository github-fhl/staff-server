const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  cfg = require('config').get('args'),
  moment = require('moment')

const
  attrMainCfg = ['id', 'name', 'contact', 'telephone', 'address', 'email'],
  attrDetailCfg = ['id', 'year', 'rate', 'max', 'min', 'companyId']


exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', false)
  ]

  if (!api.setArgs(args)) return

  getCompanys(api)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

/**
 *
 * @param {object} api 参数
 * @returns {Promise.<{rows: *, count}>}
 */
async function getCompanys (api) {
  let $companys = await models.company.findAll({
    attributes: attrMainCfg,
    order: 'id ASC',
    include: [{
      model: models.companyDetail,
      required: false,
      attributes: attrDetailCfg,
      where: {
        year: api.args.year || (new Date()).getFullYear(),
        payorType: cfg.payorType.Company
      },
    }]
  })

  return {rows: $companys, count: $companys.length}

}
exports.getCompanys = getCompanys

exports.get = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('id', true)
  ]

  if (!api.setArgs(args)) return


  let run = async () => {
    let $company = await models.company.findOne({
      where: {
        id: api.args.id
      },
      attributes: attrMainCfg,
      include: [{
        model: models.companyDetail,
        required: false,
        attributes: attrDetailCfg,
        where: {
          payorType: cfg.payorType.Company
        },
        separate: true,
        order: 'year ASC'
      }]
    })

    if (!$company) throw new Error(`${api.args.id} 不存在`)
    return $company
  }

  run()
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.new = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.company)

  if (!api.setArgs(args)) return

  let run = async t => {
    let $company = await models.company.create(api.args, {
      transaction: t
    })
    let companyDetail = {
      year: moment().year(),
      payorType: cfg.payorType.Company,
      companyId: $company.id
    }

    await models.companyDetail.create(companyDetail, {transaction: t})

    return $company
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.update = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = Arg.factory(models.company, 'put')

  if (!api.setArgs(args)) return

  let run = async t => {
    let $company = await models.company.findOne({
      where: {id: api.args.id},
      attributes: attrMainCfg,
      transaction: t
    })

    if (!$company) throw new Error(`${api.args.id}不存在`)

    await $company.update(api.args, {transaction: t})

    return $company
  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}


exports.getSocialTax = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('monthlySalary', true, 'integer'),
    new Arg('companyId', true, 'string'),
    new Arg('year', true, 'integer'),
  ]

  if (!api.setArgs(args)) return

  calculateSocialTax(api.args.monthlySalary, api.args.companyId, api.args.year)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}


/**
 * 获取社保金额
 *
 * 1. 根据年份，获取对应的社保详情
 * 2. 根据缴费率，算出预计社保金额
 * 3. 根据上下限，得到真实社保金额
 *
 * @param {number} monthlySalary 月工资
 * @param {string} companyId 对应公司 id
 * @param {number} year 年份
 * @param {object} t transaction
 * @returns {null}
 */
async function calculateSocialTax (monthlySalary, companyId, year, t) {
  monthlySalary = parseInt(monthlySalary)

  let $companyDetail = await models.companyDetail.findOne({
    transaction: t,
    where: {
      companyId,
      year,
      payorType: cfg.payorType.Company
    }
  })

  if (!$companyDetail) throw new Error(`${companyId} 在 ${year} 年份未录入社保上下限`)

  let socialTax = monthlySalary * $companyDetail.rate

  if (socialTax > $companyDetail.max) socialTax = $companyDetail.max
  if (socialTax < $companyDetail.min) socialTax = $companyDetail.min

  return socialTax
}

exports.calculateSocialTax = calculateSocialTax

