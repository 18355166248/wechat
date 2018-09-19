'use strict'

const sha1 = require('sha1')
const getRawBody = require('raw-body')

const Chat = require('./chat')
const util = require('./util')
module.exports = function (config, handler) {
  const chat = new Chat(config)

  return async function (ctx, next) {
    const token = config.wechat.token
    const timestamp = ctx.query.timestamp
    const nonce = ctx.query.nonce
    const signature = ctx.query.signature
    const echostr = ctx.query.echostr
    let str = [token, timestamp, nonce].sort().join('')
    str = sha1(str)
    if (ctx.method === 'GET') {
      if (str === signature) {
        ctx.body = echostr + ''
      } else {
        ctx.body = 'wrong'
      }
    } else if (ctx.method === 'POST') {
      if (str !== signature) {
        ctx.body = 'wrong'
        return false
      }
      const data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })
      const xmlList = await util.parseXmlAsync(data)
      const message = util.formatMessage(xmlList.xml)
      ctx.weixin = message

      await handler.call(ctx, next)
      chat.reply.call(ctx)
    }
  }
}