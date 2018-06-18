const
  StateMachine = require('javascript-state-machine'),
  moment = require('moment'),
  {models} = require('../../../models/index'),
  {generatorSingleExecutionSow} = require('../../executionSow/index'),
  {checkCreateClientPo} = require('../PO_Note/clientPo'),
  config = require('config'),
  {
    toSubmit, toApproveByFD, refusedByFD, toApproveByClient,
    refusedByClient, toCollectPO, POCollected
  } = config.flowCfg.sowStatus,
  {
    create, submit, fdRefuse, fdApprove, clientRefuse, clientApprove, collectPO
  } = config.flowCfg.sowOperation,
  {
    financeManager, financeDirector
  } = config.init.initRoles,
  {InHouse, LetGo} = config.args.clientType,
  {Y, N} = config.args,

  redis = require('redis'),
  {redisCfg, eventType} = config,
  pub = redis.createClient(redisCfg.port, redisCfg.host)

const transitions = [
  {name: create, from: ['none', toSubmit], to: toSubmit},
  {name: submit, from: [toSubmit, refusedByFD, refusedByClient], to: toApproveByFD},

  {name: fdRefuse, from: toApproveByFD, to: refusedByFD},
  {name: fdApprove, from: toApproveByFD, to: toApproveByClient},

  {name: clientRefuse, from: [toApproveByClient, toCollectPO], to: refusedByClient},
  {name: clientApprove, from: toApproveByClient, to: toCollectPO},

  {name: collectPO, from: toCollectPO, to: POCollected},

  {name: 'goto', from: '*', to: s => s}
]

const SowMachine = StateMachine.factory({
  transitions,

  data: ($sow, user, t) => ({$sow, user, t}),

  methods: {
    init () {
      this.goto(this.$sow.flowStatus)
      return this
    },

    async onCreate (action) {
      await this.$sow.createFlowLog({
        handle: action.transition,
        handler: this.user.id,
        nextHandleRole: financeManager
      }, {transaction: this.t})
      return this
    },

    async onSubmit (action) {
      await this.$sow.update({
        flowStatus: toApproveByFD
      }, {transaction: this.t})
      await this.$sow.createFlowLog({
        handle: action.transition,
        handler: this.user.id,
        nextHandleRole: financeDirector
      }, {transaction: this.t})

      pub.publish(eventType.submitSoW, JSON.stringify({
        fromUserId: this.user.id,
        sowId: this.$sow.id
      }))
      return this
    },

    async onFdRefuse (action) {
      await this.$sow.update({
        flowStatus: refusedByFD
      }, {transaction: this.t})
      await this.$sow.createFlowLog({
        handle: action.transition,
        handler: this.user.id,
        nextHandleRole: financeManager
      }, {transaction: this.t})
    },

    async onFdApprove (action) {
      await this.$sow.update({
        flowStatus: toApproveByClient
      }, {transaction: this.t})
      await this.$sow.createFlowLog({
        handle: action.transition,
        handler: this.user.id,
        nextHandleRole: financeManager
      }, {transaction: this.t})
    },

    async onClientRefuse (action) {
      await this.$sow.update({
        flowStatus: refusedByClient
      }, {transaction: this.t})
      await this.$sow.createFlowLog({
        handle: action.transition,
        handler: this.user.id,
        nextHandleRole: financeManager
      }, {transaction: this.t})
    },

    async onClientApprove (action) {
      await this.$sow.update({
        flowStatus: toCollectPO
      }, {transaction: this.t})
      await this.$sow.createFlowLog({
        handle: action.transition,
        handler: this.user.id,
        nextHandleRole: financeManager
      }, {transaction: this.t})
    },

    /**
     * 录入 PO，sow 已确认
     * 1. 废弃旧 PO，创建新 PO
     * 2. 如果 sow 的年份与今年相同，且存在对应的 execution sow，则重新创建 execution sow、inhouse、letgo
     *
     * @param {object} action  操作
     * @param {array} clientPos 客户的 po
     * @returns {null}
     */
    async onCollectPO (action, clientPos) {
      await this.$sow.update({
        flowStatus: POCollected
      }, {transaction: this.t})
      await this.$sow.createFlowLog({
        handle: action.transition,
        handler: this.user.id,
        nextHandleRole: financeManager
      }, {transaction: this.t})

      await models.clientPo.update({
        status: 0
      }, {
        where: {
          sowId: this.$sow.id
        },
        transaction: this.t
      })
      for (let clientPo of clientPos) {
        await checkCreateClientPo(clientPo.name, clientPo.id, this.t)
        clientPo.sowId = this.$sow.id
        await models.clientPo.create(clientPo, {transaction: this.t})
      }

      if (this.$sow.year === moment().year()) {
        await reGeneratorExecutionSow(this.$sow.id, this.$sow.name, this.$sow.year, this.t)
      }
    },
  }
});

exports.SowMachine = SowMachine
exports.sowTransitions = transitions

/**
 * 跨年未确认的 sow，确认时重新创建 execution sow
 *
 * 1、删除旧的 execution sow、inhouse、let go
 * 2、重新创建 execution sow、inhouse、let go
 *
 * @param {string} sowId 目标 sow 的 id
 * @param {string} sowName 名字
 * @param {number} year 年份
 * @param {object} t transacton
 * @returns {null}
 */
async function reGeneratorExecutionSow (sowId, sowName, year, t) {
  let $sows = await models.sow.findAll({
    transaction: t,
    where: {
      year,
      isExecution: N,
      $or: [
        {id: sowId},
        {
          sowType: {$in: [InHouse, LetGo]}
        }
      ]
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

  $sows.forEach($sow => {
    $sow.otherFee = JSON.parse($sow.otherFee);
  })

  let destroySowIds = (await models.sow.findAll({
    transaction: t,
    where: {
      year,
      isExecution: Y,
      $or: [
        {name: sowName},
        {
          sowType: {$in: [InHouse, LetGo]}
        }
      ]
    }
  })).map($sow => $sow.id)

  await models.clientPo.update({executionSowId: null}, {
    transaction: t,
    where: {executionSowId: {$in: destroySowIds}}
  })
  await models.sowPosition.destroy({
    transaction: t,
    where: {sowId: {$in: destroySowIds}}
  })
  await models.sow.destroy({
    transaction: t,
    where: {id: {$in: destroySowIds}}
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
