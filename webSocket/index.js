const
  app = require('express')(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  _ = require('lodash'),
  {webSocketCfg} = require('config')

let users = {}

io.on('connection',  socket => {
  console.log('a user connected: ', socket.id);

  socket.user = {
    id: null,
    roleIds: []
  }

  /**
   * 登陆时保存用户信息
   * 1. 保存用户信息
   * 2. 根据角色加入对应的 room
   *
   * data
   *  - id
   *  - roleIds
   */
  socket.on('login', data => {
    socket.user = {
      id: data.id,
      roleIds: data.roleIds,
    }

    if (!users[socket.user.id]) users[socket.user.id] = [socket.id]
    else {
      if (!users[socket.user.id].includes(socket.id)) {
        users[socket.user.id].push(socket.id)
      }
    }

    socket.user.roleIds.forEach(roleId => {
      socket.join(roleId)
    })
  })

  function removeUser (data) {
    users[socket.user.id] = _.remove(users[socket.user.id], item => item === socket.id)

    socket.user.roleIds.forEach(roleId => {
      socket.leave(roleId)
    })
  }

  /**
   * 登出
   * 1. 移除用户
   * 2. 退出 room
   */
  socket.on('logout', removeUser)
  socket.on('disconnect', removeUser)
})

http.listen(webSocketCfg.port, () => {
  console.log(`listening on ${webSocketCfg.host}:${webSocketCfg.port}`)
})

exports.io = io

/**
 * 发送消息
 * 1. 消息发送给人，根据 user.id 发送
 * 2. 消息发送给角色，根据 room 发送
 */

async function sendMsg (message) {
  if (message.data) message.data = JSON.parse(message.data)
  else message.data = {}

  if (message.toUserId) {
    if (users[message.toUserId]) {
      users[message.toUserId].forEach(id => {
        io.to(id).emit(message)
      })
    }
  }
  else {
    io.to(message.toRoleId).emit(message.messageType, message)
  }
}

exports.sendMsg = sendMsg
