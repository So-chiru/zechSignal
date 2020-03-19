const NETWORKING = require('./networking/enums')

const server = require('./networking/server')
const metadata = require('./networking/metadata')
const peerManager = require('./networking/peer')

const buffer = require('./utils/buffer')

server.wsEvent.on('open', ws => {
  console.log('open', ws.id)

  ws.peer = new peerManager.Peer(ws)
})

server.wsEvent.on('message', (ws, data) => {
  console.log('message', ws.id, data)
})

server.wsEvent.on('close', id => {
  peerManager.findPeer(id).remove()
})

server.wsCommand.on(NETWORKING.GetUUID, ws => {
  ws.sendBinaryData(
    NETWORKING.GetUUID,
    buffer.stringHexConvert(ws.id.replace(/-/g, ''))
  )
})

server.wsCommand.on(NETWORKING.GetPeerLists, (ws, data) => {
  console.log('GetPeerLists', ws.id, data)

  ws.sendCommand(
    NETWORKING.GetPeerLists,
    peerManager.getRecommendedPeers(ws, data)
  )
})

server.wsCommand.on(NETWORKING.createPeerOffer, (ws, data) => {
  data = buffer.BSONtoObject(data)

  if (!data.offer || !data.to) {
    ws.sendError('Invalid offer data.')
    return
  }

  data.fi = ws.id

  let toPeer = peerManager.findPeer(data.to)

  if (!toPeer) {
    console.log(data)

    ws.sendError(`Couldn't find the peer ${data.to}.`)
    return
  }

  toPeer.ws.sendBSON(NETWORKING.createPeerOffer, data)
})

server.wsCommand.on(NETWORKING.answerPeerOffer, (ws, data) => {
  data = buffer.BSONtoObject(data)

  if (!data.answer || !data.to || !data.answer_peer) {
    ws.sendError('Invalid answer data.')
    return
  }

  data.fi = ws.id

  let toPeer = peerManager.findPeer(data.to)

  if (!toPeer) {
    ws.sendError(`Couldn't find the peer ${data.to}.`)
    return
  }

  toPeer.ws.sendBSON(NETWORKING.answerPeerOffer, data)
})

server.wsCommand.on(NETWORKING.iceTransport, (ws, data) => {
  data = buffer.BSONtoObject(data)

  if (!data.c || !data.to) {
    ws.sendError('Invalid ICE data.')
    return
  }

  data.fi = ws.id

  let toPeer = peerManager.findPeer(data.to)

  if (!toPeer) {
    ws.sendError(`Couldn't find the peer ${data.to}.`)
    return
  }

  toPeer.ws.sendBSON(NETWORKING.iceTransport, data)
})

server.wsCommand.on(NETWORKING.RequestMetadata, (ws, data) => {
  if (!data || data.length !== 32) {
    ws.sendError('Invalid metadata request.')
    return
  }

  let id = buffer.hexStringConvert(data)
  let meta = metadata.find(id)

  if (!meta) {
    ws.sendBinaryData(NETWORKING.NoMetadata, data)
    return
  }
})

server.wsCommand.on(NETWORKING.uploadMetadata, (ws, data) => {
  data = buffer.BSONtoObject(data)

  if (!data || !data.url || !data.hash || !data.blocks) {
    ws.sendError('Invalid upload request.')
    return
  }

  new metadata.fileMetadata(data.url, data.hash, data.blocks)
})
