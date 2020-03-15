const WebSocket = require('ws')

const uuid = require('../utils/uuid')
const eventBus = require('../utils/eventBus')
const bytes = require('../utils/bytes')
const NETWORKING = require('./enums')

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

const makeCommand = (cmd, data) => {
  return JSON.stringify([cmd, data])
}

let wsEvent = new eventBus()
let wsCommand = new eventBus()

wss.on('connection', ws => {
  ws.id = uuid()
  wsEvent.emit('open', ws)

  ws.sendCommand = (cmd, data) => {
    ws.send(makeCommand(cmd, data))
  }

  ws.sendError = (data) => {
    ws.send(makeCommand(NETWORKING.ERROR, data))
  }

  ws.on('message', data => {
    if (data.length == 0 || data.length > 2 ** 16) {
      ws.close(1009)

      data = null
      ws = null

      return
    }

    if (typeof data === 'string' && /\[/.test(data)) {
      try {
        let b = JSON.parse(data)
        wsCommand.emit(b[0], ws, b[1])
        return
      } catch (e) {
        console.log(e)

        console.log(`failed to parse ${ws.id}'s data: ${data}`)
        return
      }
    }

    if (typeof data === 'object' && data[0] === NETWORKING.PING) {
      ws.send(bytes.makeBytes(1, NETWORKING.PONG))

      return
    }

    if (typeof data === 'object' && data[0]) {
      wsCommand.emit(data[0], ws)

      return
    }

    wsEvent.emit('message', ws, data)
  })

  ws.on('close', () => {
    wsEvent.emit('close', ws)
  })
})


module.exports = { ...wss, wsEvent, wsCommand }
