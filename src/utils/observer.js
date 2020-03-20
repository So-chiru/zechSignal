const observe = (ob, timeout) => {
  let tout
  let start = Date.now()

  return new Promise((resolve, reject) => {
    let f = ob()

    if (typeof f !== 'undefined' && f != null) {
      resolve(f)
      return
    }

    tout = setInterval(() => {
      let func = ob()

      if (typeof func !== 'undefined' && func != null) {
        resolve(func)

        clearTimeout(tout)
        return
      }

      if (timeout && start + timeout < Date.now()) {
        reject()
        clearTimeout(tout)
        return
      }
    }, 10)
  })
}

module.exports = observe
