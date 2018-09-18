'use strict'

const request = require('request')
const util = require('./util')

const prefix = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  access_token: prefix + 'token?grant_type=client_credential'
}
 
function Chat(opts) {
  this.appID = opts.wechat.appID
  this.appSecret = opts.wechat.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken

  this.getAccessToken().then(data => {
    try {
      data = JSON.parse(data)
    }
    catch(e) {
      return this.updateAccessToken()
    }

    if (this.isValidAccessToken(data)) {
      return Promise.resolve(data)
    } else {
      return this.updateAccessToken()
    }
  }).then(data => {
    this.access_token = data.access_token
    this.expires_in = data.expires_in

    this.saveAccessToken(data)
  })
}

Chat.prototype.isValidAccessToken = function(data) {
  if (!data || !data.access_token || !data.expires_in) return false
  const access_token = data.access_token
  const expires_in = data.expires_in
  const now = new Date().getTime()
  if (now < expires_in) return true
  else return false
}

Chat.prototype.updateAccessToken = function () {
  const appID = this.appID
  const appSecret = this.appSecret
  const url = `${api.access_token}&appid=${appID}&secret=${appSecret}`

  return new Promise((resolve, reject) => {
    request(url, function (error, response, data) {
      console.log(data)
      if (error) return false
      data = JSON.parse(data)
      const now = new Date().getTime()
      const expires_in = now + (data.expires_in -20) * 1000
      data.expires_in = expires_in
      resolve(data)
    })
  })
}

Chat.prototype.reply = function() {
  const message = this.weixin
  message.body = this.body
  var xml = util.tpl(message)
  console.log('xml', xml)
  this.status = 200
  this.type = 'application/xml'
  this.body = xml
}

module.exports = Chat