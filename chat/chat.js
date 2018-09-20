'use strict'

const request = require('request')
const util = require('./util')
const fs = require('fs')

const prefix = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  access_token: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload_img: prefix + 'media/upload?',
    fetch: 'media/get?' // 获取临时素材
  },
  permanent: {
    upload_img: prefix + 'material/add_news?', // 新增永久素材 图文 占位置
    upload_img_no: prefix + 'media/uploadimg?', // 新增永久素材 图文 不占位置
    upload_other: prefix + 'material/add_material?', // 新增永久素材 其他
    fetch_forever: prefix + 'material/get_material?', //获取永久素材
    del: prefix + 'material/del_material?', //删除永久素材
    update: prefix + 'material/update_news?', //修改永久图文素材
    count: prefix + 'material/get_materialcount?', //获取素材总数
    list: prefix + 'material/batchget_material?' //获取素材列表
  },
  group: {
    create: prefix + 'tags/create?', // 创建标签
    get: prefix + 'tags/get?', // 获取公众号已创建的标签
    update: prefix + 'tags/update?', // 编辑标签
    delete: prefix + 'tags/delete?', // 删除标签
    getuser: prefix + 'user/tag/get?', // 获取标签下粉丝列表
    batchtagging: prefix + 'tags/members/batchtagging?', // 批量为用户打标签
    batchuntagging: prefix + 'tags/members/batchuntagging?', // 批量为用户取消标签
    getidlist: prefix + 'tags/getidlist?', // 获取用户身上的标签列表
  },
  user: {
    remark: prefix + 'user/info/updateremark?', //设置用户备注名
    getUser: prefix + 'user/info?', // 获取用户基本信息(UnionID机制)
    batchget: prefix + 'user/info/batchget?', // 获取用户基本信息(UnionID机制)
    getUserList: prefix + 'user/get?', // 获取用户列表
  },
  mass: {
    uploadNews: prefix + 'media/uploadnews?', // 上传图文消息素材【订阅号与服务号认证后均可用】
    sendAll: prefix + 'message/mass/sendall?', //根据标签进行群发【订阅号与服务号认证后均可用】
  }
}

function Chat(opts) {
  this.appID = opts.wechat.appID
  this.appSecret = opts.wechat.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken

  this.getAccessToken().then(data => {
    try {
      data = JSON.parse(data)
    } catch (e) {
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
Chat.prototype.isValidAccessToken = function (data) {
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
      if (error) return false
      data = JSON.parse(data)
      const now = new Date().getTime()
      const expires_in = now + (data.expires_in - 20) * 1000
      data.expires_in = expires_in
      resolve(data)
    })
  })
}
/* 新增 临时/用久 素材 */
Chat.prototype.uploadMaterial = function (type, meterial, permanent) {
  let form = {}
  let uploadUrl = api.temporary.upload_img
  // permanent 判断 是否是永久还是临时
  if (permanent) {
    uploadUrl = api.permanent.upload_other
    form = Object.assign(form, permanent)
  }

  if (type === 'pic') {
    uploadUrl = api.permanent.upload_img_no
  }

  if (type === 'news') {
    uploadUrl = api.permanent.upload_img
    form = meterial
  } else {
    form.media = fs.createReadStream(meterial)
  }

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${uploadUrl}access_token=${data.access_token}`
      if (!permanent) url += '&type=' + type
      else form.access_token = data.access_token

      let options = {
        url: url,
        method: 'POST',
        json: true
      }
      if (type === 'news') {
        options.body = form
      } else {
        options.formData = form
      }
      request(options, function (error, response, data) {
        if (error) throw new Error('upload material error', error)
        resolve(data)
      })
    })
  })
}
/* 获取 临时/永久 素材 */
Chat.prototype.fetchMaterial = function (type, mediaid, permanent) {
  let form = {}
  let fetchUrl = api.temporary.fetch
  // permanent 判断 是否是永久还是临时
  if (permanent) fetchUrl = api.permanent.fetch_forever

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${fetchUrl}access_token=${data.access_token}`

      let options = {
        url: url,
        method: 'POST',
        json: true
      }

      if (!permanent) {
        if (type === 'video') url = url.replace('https://', 'http://')
        url += '&media_id' + mediaid
      } else {
        options.body = {
          media_id: mediaid
        }
      }

      if (type === 'news' || type === 'video') {
        request(options, function (error, response, data) {
          if (error) throw new Error('upload material error', error)
          resolve(data)
        })
      } else {
        resolve(url)
      }
    })
  })
}
/* 删除永久素材 */
Chat.prototype.delMaterial = function (mediaid) {
  const form = {
    media_id: mediaid
  }
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.permanent.del}access_token=${data.access_token}`

      request({
        url: url,
        method: 'POST',
        body: form
      }, function (error, response, data) {
        if (error) throw new Error('upload material error', error)
        resolve(data)
      })
    })
  })
}
/* 修改永久图文素材 */
Chat.prototype.updateMaterial = function (mediaid, news) {
  let form = {
    media_id: mediaid
  }
  form = Object.assign(form, news)

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.permanent.update}access_token=${data.access_token}`

      request({
        url: url,
        method: 'POST',
        body: form
      }, function (error, response, data) {
        if (error) throw new Error('upload material error', error)
        resolve(data)
      })
    })
  })
}
/* 获取素材总数 */
Chat.prototype.countMaterial = function () {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.permanent.update}access_token=${data.access_token}`

      request(url, function (error, response, data) {
        if (error) throw new Error('upload material error', error)
        resolve(data)
      })
    })
  })
}
/* 获取素材列表 */
Chat.prototype.listMaterial = function (config) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.permanent.list}access_token=${data.access_token}`

      request({
        url: url,
        method: "POST",
        body: config,
        json: true
      }, function (error, response, data) {
        if (error) throw new Error('upload material error', error)
        resolve(data)
      })
    })
  })
}

/* 创建标签 */
Chat.prototype.createTag = function (form) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.group.create}access_token=${data.access_token}`
      let options = {
        url: url,
        method: 'POST',
        body: form,
        json: true
      }
      console.log(options)
      request(options, (error, response, data) => {
        if (error) throw new Error('create error Tag111', error)
        resolve(data)
      })
    })
  })
}
/* 获取公众号已创建的标签 */
Chat.prototype.getTag = function () {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.group.get}access_token=${data.access_token}`
      request(url, (error, response, data) => {
        if (error) throw new Error('create error Tag', error)
        resolve(data)
      })
    })
  })
}
/* 编辑标签 */
Chat.prototype.updateTag = function (form) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.group.update}access_token=${data.access_token}`
      let options = {
        url: url,
        method: 'POST',
        json: true,
        body: form
      }
      request(options, (error, response, data) => {
        if (error) throw new Error('create error Tag', error)
        resolve(data)
      })
    })
  })
}
/* 删除标签 */
Chat.prototype.deleteTag = function (form) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.group.delete}access_token=${data.access_token}`
      let options = {
        url: url,
        method: 'POST',
        json: true,
        body: form
      }
      request(options, (error, response, data) => {
        if (error) throw new Error('create error Tag', error)
        resolve(data)
      })
    })
  })
}
/* 获取标签下粉丝列表 */
Chat.prototype.getuserTag = function (form) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.group.getuser}access_token=${data.access_token}`
      let options = {
        url: url,
        method: 'POST',
        json: true,
        body: form
      }
      request(options, (error, response, data) => {
        if (error) throw new Error('create error Tag', error)
        resolve(data)
      })
    })
  })
}
/* 批量为用户打标签 */
Chat.prototype.batchtaggingTag = function (form) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.group.batchtagging}access_token=${data.access_token}`
      let options = {
        url: url,
        method: 'POST',
        json: true,
        body: form
      }
      request(options, (error, response, data) => {
        if (error) throw new Error('create error Tag', error)
        resolve(data)
      })
    })
  })
}
/* 批量为用户取消标签 */
Chat.prototype.batchuntaggingTag = function (form) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.group.batchuntagging}access_token=${data.access_token}`
      let options = {
        url: url,
        method: 'POST',
        json: true,
        body: form
      }
      request(options, (error, response, data) => {
        if (error) throw new Error('create error Tag', error)
        resolve(data)
      })
    })
  })
}
/* 获取用户身上的标签列表 */
Chat.prototype.getidlistTag = function (form) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.group.getidlist}access_token=${data.access_token}`
      let options = {
        url: url,
        method: 'POST',
        json: true,
        body: form
      }
      request(options, (error, response, data) => {
        if (error) throw new Error('create error Tag', error)
        resolve(data)
      })
    })
  })
}

/* 设置用户备注名 */
Chat.prototype.remark = function (form) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.user.remark}access_token=${data.access_token}`
      let options = {
        url: url,
        method: 'POST',
        json: true,
        body: form
      }
      request(options, (error, response, data) => {
        if (error) throw new Error('create error Tag', error)
        resolve(data)
      })
    })
  })
}
/* 获取用户基本信息(UnionID机制)(单个/批量) */
Chat.prototype.getUserInfo = function (form) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let options
      let url
      if (Array.isArray(form)) {
        if (form.length === 1) {
          // 单个获取
          url = `${api.user.getUser}access_token=${data.access_token}`
          options = `${url}&openid=${form[0].openid}&lang=${form[0].lang}`
        } else {
          url = `${api.user.batchget}access_token=${data.access_token}`
          let list = {
            user_list: [{
                openid: "otvxTs4dckWG7imySrJd6jSi0CWE",
                lang: "zh_CN"
              },
              {
                openid: "otvxTs_JZ6SEiP0imdhpi50fuSZg",
                lang: "zh_CN"
              }
            ]
          }
          form.forEach(v => {
            let obj = {
              openid: openid,
              lang: lang
            }
            list.user_list.push(obj)
          })
          // 批量获取
          options = {
            url: url,
            method: 'POST',
            json: true,
            body: list
          }
        }
      }

      request(options, (error, response, data) => {
        if (error) throw new Error('create error Tag', error)
        resolve(data)
      })
    })
  })
}

/* 获取用户列表 */ 
Chat.prototype.getUserList = function(next_openid) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.user.getUserList}access_token=${data.access_token}`
      if (next_openid) url += '&next_openid=' + next_openid
      request(url, (error, response, data) => {
        if (error) throw new Error('create error Tag', error)
        resolve(data)
      })
    })
  })
}

/* 上传图文消息素材【订阅号与服务号认证后均可用】 */ 
Chat.prototype.uploadNews = function(items) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.mass.uploadNews}access_token=${data.access_token}`
      const options = {
        url: url,
        method: 'POST',
        json: true,
        body: items
      }
      request(options, (error, response, data) => {
        if (error) throw new Error('mass sendAll error', error)
        console.log('data========', data)
        resolve(data)
      })
    })
  })
}
/* 根据标签进行群发【订阅号与服务号认证后均可用】*/ 
Chat.prototype.sendAll = function(form) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(data => {
      let url = `${api.mass.sendAll}access_token=${data.access_token}`
      const options = {
        url: url,
        method: 'POST',
        json: true,
        body: form
      }
      request(options, (error, response, data) => {
        if (error) throw new Error('mass sendAll error', error)
        resolve(data)
      })
    })
  })
}

Chat.prototype.fetchAccessToken = function () {
  return new Promise((resolve, reject) => {
    if (this.access_token && this.expires_in) {
      if (this.isValidAccessToken) {
        resolve(this)
      }
    } else {
      this.getAccessToken().then(data => {
        try {
          data = JSON.parse(data)
        } catch (e) {
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
        resolve(this)
      })
    }
  })
}
Chat.prototype.reply = function () {
  const message = this.weixin
  message.body = this.body
  var xml = util.tpl(message)
  this.status = 200
  console.log('xml=====>  ', xml)
  this.type = 'application/xml'
  this.body = xml
}

module.exports = Chat