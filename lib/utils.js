const fs = require('fs')
const Task = require('data.task')

// readFile :: String -> Task([String, Error], String)
const readFile = filePath =>
  new Task((reject, resolve) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject([filePath, err])
      } else {
        resolve(data)
      }
    })
  })

// taskify :: ...a -> Promise(b, Error) -> Task(Error, b)
const taskify = f => (...args) =>
  new Task((rej, res) => {
    f(...args).then(res, rej)
  })

module.exports = {
  readFile,
  taskify,
}
