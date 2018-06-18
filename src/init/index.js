const
  {ApiDialect, Arg} = require('api-dialect'),
  {sequelize} = require('../../models/index'),
  {initSystem} = require('./system'),
  {initSow} = require('./sow'),
  {initAccount} = require('./account'),
  {initStaff} = require('./staff'),
  {initFreelancer} = require('./freelancer'),
  {initProject} = require('./project'),
  {initProduction} = require('./production'),
  {initInhouseFreelancer} = require('./inhouseFreelancer'),

  cfg = require('config').get('args'),
  flowCfg = require('config').get('flowCfg'),
  {sowTransitions} = require('../sow/stateMachine/sowMachine'),
  {recruitRegularTransitions} = require('../recruit/stateMachine/recruitRegularMachine'),
  {recruitFreelancerTransitions} = require('../recruitFreelancer/stateMachine/recruitFreelancerMachine'),
  {transferTransitions} = require('../transfer/stateMachine/transferMachine'),
  {dismissionTransitions} = require('../dismission/stateMachine/dismissionMachine'),
  {extensionTransitions} = require('../extension/stateMachine/extensionMachine'),
  {projectTransitions} = require('../project/stateMachine/projectMachine'),
  Project = require('../../components/widgets/index').Project,
  path = require('path')

const r = Project.getFiles(path.resolve(__dirname, '../systems'))

exports.default = (req, res) => {

  let api = new ApiDialect(req, res)
  let run = async t => {
    // 初始化数据库
    await sequelize.sync({force: true})

    // 初始化账号系统
    await initAccount(t)

    // 初始化系统设置
    await initSystem(t)

    if (process.env.NODE_ENV !== 'production') {
      // 初始化 sow
      await initSow(t)

      // 初始化 project
      await initProject(t)

      // 初始化 Production
      await initProduction(t)

      // 初始化 InhouseFreelancer
      await initInhouseFreelancer(t)

      // 初始化 staff
      await initStaff(t)

      // 初始化 freelancer
      await initFreelancer(t)
    }

  }

  sequelize.transaction(t => run(t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

// 获取所有的配置参数
exports.getAllArgs = (req, res) => {
  res.send({
    cfg, flowCfg,
    sowTransitions,
    recruitRegularTransitions, recruitFreelancerTransitions,
    transferTransitions, dismissionTransitions,
    extensionTransitions,
    projectTransitions,
    status: 'success'
  })
}

// 获取所有用户设置的系统参数
exports.getAllSettings = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', false)
  ]

  if (!api.setArgs(args)) return

  let run = async () => {
    let result = {}

    result.companys = await r.company.getCompanys(api)
    result.clients = await r.client.getClients(api)
    result.teams = await r.team.getTeams(api)
    result.currencys = await r.currency.getCurrencys(api)
    result.fordFunctions = await r.fordFunction.getFordFunctions(api)
    result.offices = await r.office.getOffices(api)
    result.salaryTypes = await r.salaryType.getSalaryTypes(api)
    result.stdPoss = await r.stdPos.getStdPoss(api)
    result.titles = await r.title.getTitles(api)

    return result
  }

  run()
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

