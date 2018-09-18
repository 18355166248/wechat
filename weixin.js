'use strict'

exports.reply = function(next) {
  const message = this.weixin
  console.log('weixin reply', message)
  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        console.log('扫二维码进来:', message.EventKey, message.ticket)
      }

      this.body = '哈哈, 你订阅了 牡丹江前端'
    } else if (message.Event === 'unsubscribe') {
      console.log('无情取关')
      this.body = ''
    } else if (message.Event ==='LOCATION') {
      this.body = '您上报的位置是: ' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
    } else if (message.Event === 'CLICK') {
      this.body = '您点击了菜单: ' + message.EventKey
    } else if (message.Event === 'SCAN') {
      console.log('关注后扫二维码' + message.EventKey + '' + message.Ticket)
      this.body = '看到了扫了一下哦'
    } else if (message.Event === 'VIEW') {
      this.body = '您点击了菜单中的链接: ' + message.EventKey
    }
  } else if (message.MsgType === 'text'){
    const content = message.Content
    var reply = '不知道你在说什么 text  '

    if (content === '1') {
      reply = '天下第一吃大米'
    } else if (content === '2') {
      reply = '天下第二吃豆腐'
    } else if (content === '3') {
      reply = '天下第三密码门'
    } else if (content === '4') {
      reply = [{
        Title: '测试新闻',
        Description: '这是一个描述信息',
        PicUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1537294590160&di=ca10a34965b17bb86a565996020e3ecc&imgtype=0&src=http%3A%2F%2Fpic2.52pk.com%2Ffiles%2F160216%2F5329500_160443_1.png',
        Url: 'https://mobile.zcool.com.cn/home'
      }]
    }
    this.body = reply
  }
}