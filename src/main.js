const server = require('./server')

server.wsEvent.on('open', ws => {
  console.log('open', ws.id)
})

server.wsEvent.on('message', (ws, data) => {
  console.log('message', ws.id, data)
})
