const sha3 = require('js-sha3')

let hashStorage = {}

class fileMetadata {
  constructor(url) {
    this.url = url
    this.urlHash = sha3.sha3_256(url)

    this.blocks = []

    this.hashStorage[this.urlHash] = this
  }

  getBlock(index) {
    return this.blocks[index]
  }

  setBlock(index, hash) {
    this.blocks[index] = hash
  }
}

const find = (id) => {
  return hashStorage[id]
}

module.exports = {
  fileMetadata,
  hashStorage,
  find
}