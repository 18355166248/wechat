'use strict'

const parseString = require('xml2js').parseString
const tpl = require('./tpl')

exports.parseXmlAsync = function (xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, {
      trim: true
    }, function (err, result) {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

function formatMessage(result) {
  let message = {}
  if (typeof result === 'object') {
    const keys = Object.keys(result)
    for (let i = 0; i < keys.length; i++) {
      let v = keys[i]
      let value = result[v]
      if (!(value instanceof Array) || value.length === 0) continue
      if (value.length === 1) {
        const val = value[0]
        if (typeof val === 'object') {
          message[v] = formatMessage(val)
        } else {
          message[v] = (val || '').trim()
        }
      } else {
        message[v] = []
        value.forEach(v1 => {
          message[v].push(formatMessage(v1))
        })
      }
    }
  }
  return message
}

exports.formatMessage = formatMessage

exports.tpl = function(message) {
  const info = {}
  const type = 'text'
  info.createTime = new Date().getTime()
  info.msgType = type
  info.ToUserName = message.ToUserName
  info.FromUserName = message.FromUserName
  if (Array.isArray(message.body)) {
    if (message.body[0] && message.body[0].type === 'news') {
      info.msgType = 'news'
      info.ArticleCount = message.body.length
    }
  } else if (typeof message.body === 'object' && !message.body.length) {
    info.msgType = message.body.type
    info.media_id = message.body.media_id
    info.Title = message.body.Title
    info.Description = message.body.Description
    if (info.msgType === 'video') {

    }
  }
  info.body = message.body
  return tpl.compiled(info)
}