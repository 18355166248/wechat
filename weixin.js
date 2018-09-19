'use strict'

const Chat = require('./chat/chat')
const config = require('./config')
const chatApi = new Chat(config)

exports.reply = async function (next) {
  const message = this.weixin
  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        console.log('扫二维码进来:', message.EventKey, message.ticket)
      }

      this.body = '哈哈, 你订阅了 牡丹江前端'
    } else if (message.Event === 'unsubscribe') {
      console.log('无情取关')
      this.body = ''
    } else if (message.Event === 'LOCATION') {
      this.body = '您上报的位置是: ' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
    } else if (message.Event === 'CLICK') {
      this.body = '您点击了菜单: ' + message.EventKey
    } else if (message.Event === 'SCAN') {
      console.log('关注后扫二维码' + message.EventKey + '' + message.Ticket)
      this.body = '看到了扫了一下哦'
    } else if (message.Event === 'VIEW') {
      this.body = '您点击了菜单中的链接: ' + message.EventKey
    }
  } else if (message.MsgType === 'text') {
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
        type: 'news',
        Title: '测试新闻',
        Description: '这是一个描述信息',
        PicUrl: __dirname + '/static/img/1.jpg',
        Url: 'https://mobile.zcool.com.cn/home'
      }]
    } else if (content === '5') {
      const data = await chatApi.uploadMaterial('image', __dirname + '/static/img/1.jpg')

      reply = {
        type: 'image',
        media_id: data.media_id
      }
    } else if (content === '6') {
      const data = await chatApi.uploadMaterial('video', __dirname + '/static/video/apple.mp4')

      reply = {
        type: 'video',
        media_id: data.media_id,
        Title: '苹果回应苹果价格过高',
        Description: '爱买不买, 穷逼不配玩苹果'
      }
    } else if (content === '7') {
      const data = await chatApi.uploadMaterial('image', __dirname + '/static/img/2.jpg', {
        type: 'image'
      })

      reply = {
        type: 'image',
        media_id: data.media_id
      }
    } else if (content === '8') {
      const data = await chatApi.uploadMaterial('video', __dirname + '/static/video/be.mp4', {
        type: 'video',
        description: '{"title":"永久视频122", "introduction":"永久视频--描述"'
      })

      reply = {
        type: 'video',
        media_id: data.media_id,
        Title: '苹果回应苹果价格过高-永久',
        Description: '爱买不买, 穷逼不配玩苹果'
      }
    } else if (content === '9') {
      const picData = await chatApi.uploadMaterial('image', __dirname + '/static/img/2.jpg', {})

      let media = {
        "articles": [{
            "title": '测试-永久图片',
            "thumb_media_id": picData.media_id,
            "author": '江浪',
            "digest": '这是一个摘要',
            "show_cover_pic": 1,
            "content": '没有内容',
            "content_source_url": 'https://m.jd.com/'
          },
          //若新增的是多图文素材，则此处应还有几段articles结构
        ]
      }

      let data = await chatApi.uploadMaterial('news', media, {})

      data = await chatApi.fetchMaterial('news', data.media_id, {})

      console.log(data)

      const items = data.news_item
      let news = []
      console.log('item======', items)
      items.forEach(v => {
        news.push({
          type: 'news',
          Title: v.title,
          Description: v.digest,
          PicUrl: v.url,
          Url: v.content_source_url
        })
      })

      reply = items
    }

    this.body = reply
  }
}