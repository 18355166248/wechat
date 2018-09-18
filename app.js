'use strict'

const koa = require('koa')
const path = require('path')
const chat = require('./chat/g')
const chat_file =  path.join(__dirname, './config/wechat.txt')
const util = require('./libs/util')

const server = new koa()

const config = {
  wechat: {
    appID:'wxfd6698aa07dcb11e',
    appSecret: 'e5b8725cc26e8dc5a8f17fadfcd8d815',
    token: 'amlhbmdsYW5nZGFuNTExODcxOTAx'
  },
  getAccessToken() {
    return util.readFileAsync(chat_file)
  },
  saveAccessToken(data) {
    data = JSON.stringify(data)
    return util.writeFileAsync(chat_file, data)
  }
}

server.use(chat(config))

server.listen(3003)
console.log('port is listen 3003')
