const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../../models/index'),
  {attrClientPo} = require('../../args'),
  {checkExist} = require('../../../components/widgets'),
  {N} = require('config').get('args')


const getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('sowId', true)
  ]

  if (!api.setArgs(receiveArgs)) return

  let run = async args => {
    let $sow = await models.sow.findOne({
      where: {id: args.sowId},
      attributes: ['id', 'isExecution']
    })

    if (!$sow) throw new Error(`${args.sowId} 不存在`)

    let key = $sow.isExecution === N ? 'sowId' : 'executionSowId'

    let clientPos = await models.clientPo.findAll({
      where: {
        [key]: args.sowId,
        status: 1
      },
      attributes: attrClientPo
    })

    clientPos.forEach(clientPo => {
      clientPo.passThroughFee = JSON.parse(clientPo.passThroughFee)
    })

    return clientPos
  }

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

exports.getList = getList


const update = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('clientPos', true)
  ]

  if (!api.setArgs(receiveArgs)) return

  let run = async (args, t) => {

    for (let clientPo of args.clientPos) {
      checkExist(clientPo, ['id', 'name', 'filePath', 'total', 'passThroughFee'])

      await checkCreateClientPo(clientPo.name, clientPo.id, t)
      await models.clientPo.update(clientPo, {
        where: {id: clientPo.id},
        transaction: t
      })
    }
  }

  sequelize.transaction(t => run(api.args, t))
    .then(objs => {
      api
        .setResponse(objs)
        .send()
    })
    .catch(err => api.error(err))
}

exports.update = update

/**
 * 检查 clientPo 的重名
 * 1. 创建的情况，status=1 对应的 clientPo 不能存在相同名字
 * 2. 编辑情况，status = 1 并排除掉当前 clientPo，不能存在相同名字
 *
 * @param {string} name clientPo 的名字
 * @param {string} id clientPo 的 id
 * @param {object} t transaction
 * @returns {null}
 */
async function checkCreateClientPo (name, id, t) {
  if (!id) {
    let count = await models.clientPo.count({
      transaction: t,
      where: {
        name,
        status: 1
      }
    })

    if (count !== 0) throw new Error(`该名称已存在 ${name}`)
  }
  else {
    let count = await models.clientPo.count({
      transaction: t,
      where: {
        status: 1,
        id: {$ne: id}
      }
    })

    if (count !== 0) throw new Error(`该名称已存在 ${name}`)
  }
}

exports.checkCreateClientPo = checkCreateClientPo
