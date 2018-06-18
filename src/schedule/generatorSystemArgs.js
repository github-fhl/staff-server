const
  {models, sequelize} = require('../../models/index'),
  schedule = require('node-schedule'),
  uuidv1 = require('uuid/v1'),
  {generatorSystemArgsRule} = require('./rules'),
  moment = require('moment')

/**
 * 跨年时根据去年的数据，复制一版今年的数据：
 * 1. companyDetail
 * 2. currencyDetail
 * 3. OfficeDetail
 * 4. stdPosDetail、stdPosPrice
 */

exports.generatorSystemArgs = schedule.scheduleJob(generatorSystemArgsRule, () => {
  let nowYear = moment().year()

  sequelize.transaction(t => run(nowYear, t))
})

async function run (nowYear, t) {

  let modelArr = [models.companyDetail, models.currencyDetail, models.officeDetail]

  for (let model of modelArr) {
    await createDetails(model, nowYear, t)
  }

  let $stdPosDetails = await models.stdPosDetail.findAll({
    transaction: t,
    where: {
      year: nowYear - 1,
    },
    include: [{
      model: models.stdPosPrice,
      attributes: ['salaryTypeId', 'amount']
    }]
  })

  let
    newStdPosDetails = [],
    newStdPosPrices = []

  for (let $stdPosDetail of $stdPosDetails) {
    let newStdPosDetail = {
      id: uuidv1(),
      stdPosId: $stdPosDetail.stdPosId,
      skillLevel: $stdPosDetail.skillLevel,
      year: nowYear,
    }

    newStdPosDetails.push(newStdPosDetail)
    for (let $stdPosPrice of $stdPosDetail.stdPosPrices) {
      newStdPosPrices.push({
        ...$stdPosPrice.dataValues,
        stdPosDetailId: newStdPosDetail.id
      })
    }
  }

  await models.stdPosDetail.bulkCreate(newStdPosDetails, {transaction: t})
  await models.stdPosPrice.bulkCreate(newStdPosPrices, {transaction: t})
}
exports.generatorSystemArgsRun = run


async function createDetails (model, nowYear, t) {

  let $details = await model.findAll({
    transaction: t,
    where: {year: nowYear - 1},
  })
  let newDetail = $details.map($detail => {
    delete $detail.dataValues.id
    delete $detail.dataValues.remark
    delete $detail.dataValues.createdAt
    delete $detail.dataValues.updatedAt
    delete $detail.dataValues.createdUsr
    delete $detail.dataValues.updatedUsr

    return {
      ...$detail.dataValues,
      year: nowYear
    }
  })

  await model.bulkCreate(newDetail, {transaction: t})
}
