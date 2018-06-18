const
  redis = require('redis'),
  {simpleValidate} = require('../../helper'),
  {eventType, redisCfg, cfg, modelPath, init, wsPath} = require('config'),
  {models} = require(modelPath),
  {
    financeDirector
  } = init.initRoles,
  sub = redis.createClient(redisCfg.port, redisCfg.host),

  {sendMsg} = require(wsPath)

sub.subscribe(eventType.submitSoW)

/**
 * 提交 SoW
 * 1. 需要给 财务总监 发送 message
 */
sub.on('message', async (channel, msg) => {
  try {
    msg = JSON.parse(msg)
    let rule = {
      sowId: 'string',
      fromUserId: 'string',
    }
    let args = simpleValidate(rule, msg)

    if (!args) return

    let $sow = await models.sow.findByPrimary(args.sowId)
    let $fromUser = await models.account.findByPrimary(args.fromUserId)
    let message = {
      messageType: cfg.messageType.notification,
      fromUserId: args.fromUserId,
      toRoleId: financeDirector,
      eventName: eventType.submitSoW,
      content: `${$fromUser.name} 已经提交了 ${$sow.name}，请审批`,
      data: JSON.stringify({
        id: $sow.id,
        name: $sow.name,
        flowStatus: $sow.flowStatus,
        fromUserName: $fromUser.name
      })
    }

    let $message = await models.message.create(message)

    sendMsg($message.dataValues)
  }
  catch (error) {
    console.error(error)
  }
})
