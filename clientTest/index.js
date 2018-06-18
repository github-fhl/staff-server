const
  {ApiDialect} = require('api-dialect'),
  {sequelize} = require('../models/index'),
  {insertCompany} = require('./system/insertCompany'),
  {insertClient} = require('./system/insertClient'),
  {insertOffice} = require('./system/insertOffice'),
  {insertCurrency} = require('./system/insertCurrency'),
  {insertFordFunction} = require('./system/insertFordFunction'),
  {insertStdPos} = require('./system/insertStdPos'),
  {insertSalaryType} = require('./system/insertSalaryType'),
  {insertStaff} = require('./insertStaff/index'),
  {insertOrgNode} = require('./insertOrgNode'),
  {insertSowLevel} = require('./sow/insertSowLevel'),
  {insertSow} = require('./sow/insertSow'),
  {insertPosition} = require('./position/insertPosition'),
  {insertSowPosition} = require('./position/insertSowPosition'),
  {insertPositionLog} = require('./position/insertPositionLog'),
  {initAccount} = require('../src/init/account'),
  {generator} = require('../src/executionSow'),
  accessValidator = require('../components').RBAC,
  Excel = require('exceljs'),
  path = require('path')

function clientTest (req, res) {
  let api = new ApiDialect(req, res)

  sequelize.transaction(t => run(path.join(__dirname, './客户测试数据-2018.xlsx'), t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

exports.clientTest = clientTest


/**
 * 1. 初始化数据库
 * 2. 初始化账号
 * 3. 初始化系统设置
 * 4. 初始化 SoW
 * 5. 初始化 Staff
 */

async function run (filePath, t) {

  await sequelize.sync({force: true})
  await initAccount(t)

  let workbook = new Excel.Workbook()

  await workbook.xlsx.readFile(filePath)
  await insertCompany(workbook, t)
  await insertClient(workbook, t)
  await insertCurrency(workbook, t)
  await insertOffice(workbook, t)
  await insertFordFunction(workbook, t)
  await insertSalaryType(workbook, t)
  await insertStdPos(workbook, t)
  await insertStaff(workbook, t)
  await insertOrgNode(workbook, t)
  await insertSowLevel(workbook, t)
  await insertSow(workbook, t)

  let positions = await insertPosition(workbook, t)

  // await insertSowPosition(positions, t)
  await insertPositionLog(positions, t)

  await insertSowPosition(workbook, t)
  // await insertPositionLog(workbook, t)

  await generator(2018, t)
  await accessValidator.buildRBACArgs(t)
}
