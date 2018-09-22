'use strict'

module.exports = {
  button: [{
      type: 'click',
      name: '点击事件1111',
      key: 'menu-click'
    },
    {
      name: '点出菜单',
      sub_button: [{
          type: 'view',
          name: '搜索',
          url: 'http://www.soso.com/'
        }, {
          type: 'scancode_push',
          name: '扫码推送事件',
          key: 'saoma'
        }, {
          type: 'scancode_waitmsg',
          name: '扫码推送',
          key: 'saoma-event'
        }, {
          type: 'pic_sysphoto',
          name: '系统拍照',
          key: 'photo'
        }, {
          type: 'pic_photo_or_album',
          name: '弹出拍照或者相册',
          key: 'camera'
        }
      ]
    },
    {
      name: '点出菜单2',
      sub_button: [{
        type: 'pic_weixin',
        name: '微信相册发图器',
        key: 'weixin-pic'
      }, {
        type: 'location_select',
        name: '地理位置',
        key: 'location'
      }
      // , {
      //   type: 'media_id',
      //   name: '下发图片消息',
      //   media_id: 'media_id'
      // }, {
      //   type: 'view_limited',
      //   name: '跳转图文消息URL',
      //   media_id: 'view_limited'
      // }
    ]
    }
  ]
}