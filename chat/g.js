'use strict'

const sha1 = require('sha1')
const getRawBody = require('raw-body')

const Chat = require('./chat')
const util = require('./util')
module.exports = function (config) {
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

      if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
          console.log(message)
          const now = new Date().getTime()
          ctx.status = 200
          ctx.type = 'application/xml'
          ctx.body = `<xml><ToUserName><![CDATA[${message.FromUserName}]]></ToUserName><FromUserName><![CDATA[${message.ToUserName}]]></FromUserName> <CreateTime>${now}</CreateTime> <MsgType><![CDATA[text]]></MsgType><Content><![CDATA[我草拟妹!真的气]]></Content></xml>`
          return
        }
      }
    }
  }
}