const NETWORKING = require('./networking/enums')

const server = require('./networking/server')
const peerManager = require('./networking/peer')

server.wsEvent.on('open', ws => {
  console.log('open', ws.id)

  ws.peer = new peerManager.Peer(ws)
})

server.wsEvent.on('message', (ws, data) => {
  console.log('message', ws.id, data)
})

server.wsEvent.on('close', ws => {
  console.log('close', ws.id)
  peerManager.findPeer(ws.id).remove()
})

server.wsCommand.on(NETWORKING.GetUUID, ws => {
  ws.sendCommand(NETWORKING.GetUUID, ws.id)
})

server.wsCommand.on(NETWORKING.GetPeerLists, (ws, data) => {
  console.log('GetPeerLists', ws.id, data)

  ws.sendCommand(
    NETWORKING.GetPeerLists,
    peerManager.getRecommendedPeers(ws, data)
  )
})

server.wsCommand.on(NETWORKING.createPeerOffer, (ws, data) => {
  if (!data.offer || !data.to) {
    ws.sendError('Invalid offer data.')
    return
  }

  data.from = ws.id

  let toPeer = peerManager.findPeer(data.to)

  if (!toPeer) {
    ws.sendError(`Couldn't find the peer ${data.to}.`)
    return
  }

  toPeer.ws.sendCommand(NETWORKING.createPeerOffer, data)
})

server.wsCommand.on(NETWORKING.answerPeerOffer, (ws, data) => {
  if (!data.answer || !data.to || !data.answer_peer) {  
    ws.sendError('Invalid answer data.')
    return
  }

  data.from = ws.id

  let toPeer = peerManager.findPeer(data.to)

  if (!toPeer) {
    ws.sendError(`Couldn't find the peer ${data.to}.`)
    return
  }

  toPeer.ws.sendCommand(NETWORKING.answerPeerOffer, data)
})

server.wsCommand.on(NETWORKING.iceTransport, (ws, data) => {
  if (!data.candidate || !data.to) {
    console.log(data)

    ws.sendError('Invalid answer data.')
    return
  }

  data.from = ws.id

  let toPeer = peerManager.findPeer(data.to)

  if (!toPeer) {
    ws.sendError(`Couldn't find the peer ${data.to}.`)
    return
  }

  toPeer.ws.sendCommand(NETWORKING.iceTransport, data)
})