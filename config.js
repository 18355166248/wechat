const util = require('./libs/util')
const path = require('path')
const chat_file =  path.join(__dirname, './config/wechat.txt')
const ticket_file =  path.join(__dirname, './config/ticket.txt')

const config = {
  wechat: {
    appID:'wxfd6698aa07dcb11e',
    appSecret: 'e5b8725cc26e8dc5a8f17fadfcd8d815',
    token: 'amlhbmdsYW5nZGFuNTExODcxOTAx'
  },
  getAccessToken() {
    return util.readFileAsync(chat_file)
  },
  saveAccessToken(data) {
    data = JSON.stringify(data)
    return util.writeFileAsync(chat_file, data)
  },
  getTicket() {
    return util.readFileAsync(ticket_file)
  },
  saveTicket(data) {
    data = JSON.stringify(data)
    return util.writeFileAsync(ticket_file, data)
  }
}

module.exports = config