const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  uuidv1 = require('uuid/v1'),
  {disabled, POCollected, special} = require('config').get('flowCfg').sowStatus,
  {Y, N} = require('config').get('args')

/**
 * 跨年时生成 execution sow
 *
 * 1. pocollected、special 的 sow，对应的 execution sowPosition status = 2、comfirmFlag = Y
 * 2. 非 pocollected、special 的 sow，对应的 execution sowPosition status = 2、comfirmFlag = N
 * 3. 将对应 sow 的 clientPo 也对应上 executionSow
 *
 * @param {number} year 生成年份
 * @param {object} t transaction
 * @returns {null}
 */

async function generator (year, t) {
  await checkGeneratorExecutionSow(year, t)

  let $sows = await models.sow.findAll({
    transaction: t,
    where: {
      year,
      flowStatus: {$ne: disabled}
    },
    attributes: {exclude: ['createdAt', 'updatedAt']},
    include: [{
      model: models.sowPosition,
      attributes: {exclude: ['createdAt', 'updatedAt']},
    }, {
      model: models.clientPo,
      attributes: ['id', 'executionSowId']
    }]
  })
  let
    executionSowArr = [],
    executionSowPositionArr = [],
    clientPoArr = []

  for (let $sow of $sows) {
    let {executionSow, executionSowPositions, clientPos} = generatorSingleExecutionSow($sow, $sow.sowPositions, $sow.clientPos)

    executionSowArr.push(executionSow)
    executionSowPositionArr = executionSowPositionArr.concat(executionSowPositions)
    clientPoArr = clientPoArr.concat(clientPos)
  }

  await models.sow.bulkCreate(executionSowArr, {transaction: t})
  await models.sowPosition.bulkCreate(executionSowPositionArr, {transaction: t})

  for (let clientPo of clientPoArr) {
    await models.clientPo.update(clientPo, {
      transaction: t,
      where: {id: clientPo.id}
    })
  }
}
exports.generator = generator

/**
 * 检验是否能够生成对应的 execution sow
 * 1. 对应年份不能存在 execution sow
 *
 * @param {number} year 生成年份
 * @param {object} t transaction
 * @returns {null}
 */
async function checkGeneratorExecutionSow (year, t) {
  let count = await models.sow.count({
    where: {
      year,
      isExecution: Y
    },
    transaction: t
  })

  if (count !== 0) throw new Error(`${year} 年存在 Execution SoW`)
}

/**
 * 根据目标 sow，sowPosition，生成 execution 的 sow、sowPosition
 * 1. Sequelize.uuidv1 获得新的 id
 * 2. version = 000
 * 3. 如果目标 sow 的状态为 POCllected、special，则对应的 sowPosition 为已确认
 * 4. 复制对应的 ClientPo，关联到 execution sow 中
 *
 * @param {object} $sow 复制的目标 sow
 * @param {array} $sowPositions 复制的目标 sowPosition
 * @param {array} $clientPos 修改的目标 clientPo
 * @return {object}
 *    executionSow
 *    executionSowPositions
 *    executionClientPos
 */
function generatorSingleExecutionSow ($sow, $sowPositions, $clientPos) {
  let executionSow = {
    ...$sow.dataValues,
    id: uuidv1(),
    version: '000',
    isExecution: Y
  }
  let executionSowPositions = $sowPositions.map($sowPosition => ({
      ...$sowPosition.dataValues,
      id: uuidv1(),
      sowId: executionSow.id,
      confirmFlag: [POCollected, special].includes(executionSow.flowStatus) ? Y : N,
      status: 2
    })
  )

  let clientPos = $clientPos.map($clientPo => ({
    ...$clientPo.dataValues,
    executionSowId: executionSow.id,
  }))

  return {executionSow, executionSowPositions, clientPos}
}
exports.generatorSingleExecutionSow = generatorSingleExecutionSow

exports.testGeneratorExecutionSow = (req, res) => {

  let api = new ApiDialect(req, res)
  let args = [
    new Arg('year', true)
  ]

  if (!api.setArgs(args)) return

  sequelize.transaction(t => generator(parseInt(api.args.year), t))
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))
}

