const sha3 = require('js-sha3')

const eventBus = require('../utils/eventBus')

let hashStorage = {}

class fileMetadata {
  constructor (url, hash, blocks) {
    this.url = url
    this.urlHash = sha3.sha3_256(url)

    this.hash = hash
    this.blocks = blocks

    this.peers = []

    this.bus = new eventBus()
    this.bus.on('peer', () => {})

    hashStorage[this.urlHash] = this
  }

  addPeer (peer) {
    this.bus.emit('peer', peer)
    this.peers.push(peer)
  }

  getActivePeer () {
    let active = []

    let len = this.peers.length
    for (var i = 0; i < len; i++) {
      let peer = this.peers[i]

      if (peer.ws) {
        active.push(peer)
      }
    }

    return active
  }

  getBlock (index) {
    return this.blocks[index]
  }

  setBlock (index, hash) {
    this.blocks[index] = hash
  }
}

const find = id => {
  return hashStorage[id]
}

module.exports = {
  fileMetadata,
  hashStorage,
  find
}
