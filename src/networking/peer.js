const server = require('./server')

let peerLists = {}

class Peer {
  constructor (ws) {
    this.ws = ws
    this.id = ws.id

    peerLists[ws.id] = this
  }

  remove () {
    delete peerLists[this.id]
    delete this
  }
}

const findPeer = id => {
  return peerLists[id]
}

const activePeerID = peers => {
  let len = peers.length
  let res = []

  for (var i = 0; i < len; i++) {
    let peer = peers[i]

    if (peer.ws && !peer.ws.closed) {
      res.push(peers[i].id)
    }
  }

  return res
}

const getRecommendedPeers = (ws, option) => {
  let peers = []

  let objKeys = Object.keys(peerLists)
  let objKeyLen = objKeys.length

  for (var i = 0; i < objKeyLen; i++) {
    let v = peerLists[objKeys[i]]
    if (v.id == ws.id) continue

    peers.push(v.id)
  }

  return peers
}

module.exports = {
  Peer,
  findPeer,
  activePeerID,
  getRecommendedPeers
}
