'user strict'

const compiled = function(message) {
  switch (message.msgType) {
    case 'text':
      return `<xml><ToUserName><![CDATA[${message.FromUserName}]]></ToUserName><FromUserName><![CDATA[${message.ToUserName}]]></FromUserName><CreateTime>${message.createTime}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${message.body}]]></Content></xml>`
      break
    case 'image':
      return `<xml><ToUserName><![CDATA[${message.FromUserName}]]></ToUserName><FromUserName><![CDATA[${message.ToUserName}]]></FromUserName><CreateTime>${message.createTime}</CreateTime><MsgType><![CDATA[image]]></MsgType><Image><MediaId><![CDATA[${message.media_id}]]></MediaId></Image></xml>`
      break
    case 'voice':
      return `<xml><ToUserName><![CDATA[${message.FromUserName}]]></ToUserName><FromUserName><![CDATA[${message.ToUserName}]]></FromUserName><CreateTime>${message.createTime}</CreateTime><MsgType><![CDATA[voice]]></MsgType><Voice><MediaId><![CDATA[${message.media_id}]]></MediaId></Voice></xml>`
      break
    case 'video':
      return `<xml><ToUserName><![CDATA[${message.FromUserName}]]></ToUserName><FromUserName><![CDATA[${message.ToUserName}]]></FromUserName><CreateTime>${message.CreateTime}</CreateTime><MsgType><![CDATA[video]]></MsgType><Video><MediaId><![CDATA[${message.media_id}]]></MediaId><Title><![CDATA[${message.Title}]]></Title><Description><![CDATA[${message.Description}]]></Description></Video></xml>`
      break
    case 'music':
      return `<xml><ToUserName><![CDATA[${message.FromUserName}]]></ToUserName><FromUserName><![CDATA[${message.ToUserName}]]></FromUserName><CreateTime>${message.createTime}</CreateTime><MsgType><![CDATA[music]]></MsgType><Music><Title><![CDATA[${message.TITLE}]]></Title><Description><![CDATA[${message.DESCRIPTION}]]></Description><MusicUrl><![CDATA[${message.MUSIC_Url}]]></MusicUrl><HQMusicUrl><![CDATA[${message.HQ_MUSIC_Url}]]></HQMusicUrl><ThumbMediaId><![CDATA[${message.media_id}]]></ThumbMediaId></Music></xml>`
      break
    case 'news':
      let txt = ''
      message.body.forEach(v => {
        let item = `<item><Title><![CDATA[${v.Title}]]></Title><Description><![CDATA[${v.Description}]]></Description><PicUrl><![CDATA[${v.PicUrl}]]></PicUrl><Url><![CDATA[${v.Url}]]></Url></item>`
        txt += item
      })
      return `<xml><ToUserName><![CDATA[${message.FromUserName}]]></ToUserName><FromUserName><![CDATA[${message.ToUserName}]]></FromUserName><CreateTime>${message.createTime}</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>${message.ArticleCount}</ArticleCount><Articles>${txt}</Articles></xml>`
      break
  }
}

exports = module.exports = {
  compiled: compiled
}