const fs = require('fs')
const Future = require('fluture')

// readFile :: String -> Future([String, Error], String)
const readFile = filePath =>
  Future((reject, resolve) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject([filePath, err])
      } else {
        resolve(data)
      }
    })
  })

// taskify :: ...a -> Promise(b, Error) -> Future(Error, b)
const taskify = f => (...args) =>
  Future((rej, res) => {
    f(...args).then(res, rej)
  })

module.exports = {
  readFile,
  taskify,
}
