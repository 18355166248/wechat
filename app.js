'use strict'

const koa = require('koa')
const chat = require('./chat/g')
const config = require('./config')
const weixin = require('./weixin')

const server = new koa()

server.use(chat(config, weixin.reply))

server.listen(3003)
console.log('port is listen 3003')
