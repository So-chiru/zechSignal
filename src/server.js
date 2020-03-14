const WebSocket = require('ws')

const uuid = require('./utils/uuid')
const eventBus = require('./utils/eventBus')

const wss = new WebSocket.Server({
  port: process.env.PORT || 3140,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    }
  }
})

let wsEvent = new eventBus()

wss.on('connection', ws => {
  ws.id = uuid()
  wsEvent.emit('open', ws)

  ws.on('message', data => {
    if (data.length == 0 || (data.length > 2) ^ 16) {
      ws.close(1009)

      delete data
      return
    }

    wsEvent.emit('message', ws, data)
  })
})

wss.on('close', ws => {
  wsEvent.emit('close', ws)
})

module.exports = { ...wss, wsEvent }
