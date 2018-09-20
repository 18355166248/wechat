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
      const data = await chatApi.uploadMaterial('video', __dirname + '/static/video/3.mp4', {
        type: 'video',
        description: '{"title":"永久视频122", "introduction":"永久视频--描述"'
      })

      reply = {
        type: 'video',
        media_id: data.media_id,
        Title: '20mIAO短视频-永久',
        Description: '测试-=-=大萨达是'
      }
    } else if (content === '9') {
      const picData = await chatApi.uploadMaterial('image', __dirname + '/static/img/2.jpg', {})
      console.log('是的撒大大', picData)
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

      const items = data.news_item
      console.log('items==========', items)
      let news = []

      items.forEach(v => {
        news.push({
          type: 'news',
          Title: v.title,
          Description: v.digest,
          PicUrl: v.thumb_url,
          Url: v.url
        })
      })

      reply = news
    } else if (content === '素材列表') {
      let list = await chatApi.listMaterial({type: 'news', offset: 0, count: 5})
      list = JSON.stringify(list)
      console.log(list)
      reply = '获取成功'
    } else if (content === '打标签102') {
      let list = await chatApi.batchtaggingTag({openid_list : [message.FromUserName],   
        "tagid" : 102 })
      console.log(list)
      reply = '打标签成功'
    } else if (content === '10') {
      try {
        await chatApi.deleteTag({tag:{id: 100}})
        await chatApi.deleteTag({tag:{id: 101}})
        await chatApi.deleteTag({tag:{id: 103}})
        await chatApi.deleteTag({tag:{id: 104}})
      } catch (error) {
        throw new Error('delete error', error)
      }

      const list = await chatApi.getTag()
      console.log(list)
      const tagList = await chatApi.getidlistTag({openid: message.FromUserName})
      console.log(tagList)
      reply = JSON.stringify(list)
    } else if (content === '11') {
      const userData = await chatApi.getUserInfo([{openid: message.FromUserName, lang: 'zh_CN'}])
      console.log(userData)
      reply = userData
    } else if (content === '12') {
      const userList = await chatApi.getUserList()
      const openid = JSON.parse(userList).data.openid[0]
      const userData = await chatApi.getUserInfo([{openid: openid, lang: 'zh_CN'}])
      reply = userData
    } else if (content === '13') {
      const sendAll = {
        filter:{
           is_to_all: false,
           tag_id: 102
        },
        mpnews:{
           media_id: 'BwaPLY_-eqGXJAT2qkCK-4JmvPI0Krl-joLlZIip-3M'
        },
         msgtype: 'mpnews',
         send_ignore_reprint:0
      }
      const txt = {
        filter:{
           is_to_all:false,
           tag_id: 102
        },
        text:{
           content:"测试1232131232131231231232145654645"
        },
         msgtype:"text"
     }
      const send = await chatApi.sendAll(sendAll)
      console.log(send)
      reply = '群发成功'
    }

    this.body = reply
  }
}