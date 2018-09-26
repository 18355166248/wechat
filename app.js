'use strict'

const koa = require('koa')
const sha1 = require('sha1')
const chat = require('./chat/g')
const config = require('./config')
const weixin = require('./weixin')
const ejs = require('ejs')
const heredoc = require('heredoc')
const wechat = require('./chat/chat')

const server = new koa()

const tpl = heredoc(function () {
  /*
  <!DOCTYPE html>
  <html>
    <head>
      <title>搜电影</title>
      <meta name="viewport" content="initial-scale=1, maximum-scale=1, minium-scale=1">
    </head>
    <body>
      <h1>点击标题, 开始录音翻译</h1>
      <p id="title"></p>
      <p id="year"></p>
      <p id="doctor"></p>
      <div id="poster"></div>
      <script src="http://www.css88.com/doc/zeptojs_api/zepto-docs.min.js"></script>
      <script src="http://res.wx.qq.com/open/js/jweixin-1.4.0.js"></script>
      <script>
        wx.config({
          debug: false,
          appId: 'wxfd6698aa07dcb11e', // 必填，公众号的唯一标识
          timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
          nonceStr: '<%= nonceStr %>', // 必填，生成签名的随机串
          signature: '<%= signature %>',// 必填，签名
          jsApiList: [
            'startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'translateVoice',
          ]
        });
        
        wx.ready(function() {
          wx.checkJsApi({
            jsApiList: ['startRecord'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
            success: function(res) {
              // 以键值对的形式返回，可用的api值true，不可用为false
              // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
              console.log('res----->', res)
            }
          });
          let onoff = false
          $("h1").on('tap', function() {
            if (!onoff) {
              onoff = true
              wx.startRecord({
                cancel: function() {
                  window.alert('不能搜索了')
                }
              });
              return
            }
            onoff = false

            wx.stopRecord({
              success: function (res) {
                var localId = res.localId

                wx.translateVoice({
                  localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                  isShowProgressTips: 1, // 默认为1，显示进度提示
                  success: function (res) {
                    window.alert('语音识别', res.translateResult); // 语音识别的结果
                  }
                });
              }
            });
          })
        })
      </script>
    </body>
  </html>`
  */
})

/* 获取随机字符串 */
const createNone = function () {
  return Math.random().toString(36).substr(2, 15)
}
/* 获取当前时间戳 s */
const createTime = function () {
  return parseInt(new Date().getTime() / 1000, 10) + ''
}
const _sign = function (nonceStr, timestamp, ticket, url) {
  const params = [
    'noncestr=' + nonceStr,
    'timestamp=' + timestamp,
    'jsapi_ticket=' + ticket,
    'url=' + url
  ]
  const str = params.sort().join('&')
  const txt = sha1(str)
  return txt
}

function sign(ticket, url) {
  const nonceStr = createNone()
  const timestamp = createTime()
  const signature = _sign(nonceStr, timestamp, ticket, url)
  return {
    nonceStr: nonceStr,
    timestamp: timestamp,
    signature: signature
  }
}

server.use(async function (ctx, next) {
  console.log(ctx.url, ctx.url.indexOf('/movie'))
  if (ctx.url.indexOf('/movie') > -1 && ctx.url !== '/favicon.ico') {
    const wechatApi = new wechat(config)
    const access_token = await wechatApi.fetchAccessToken()
    const ticketList = await wechatApi.fetchTicket(access_token.access_token)
    const obj = sign(ticketList.ticket, ctx.href)
    // console.log(obj)
    return ctx.body = ejs.render(tpl, obj)
  }
  await next()
})

server.use(chat(config, weixin.reply))

server.listen(3003)
console.log('port is listen 3003')