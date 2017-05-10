const fs = require('fs')
const path = require('path')

const Either = require('data.either')
const R = require('ramda')

const defaults = require('./defaults')

// readConf :: Bool -> Bool -> String -> Object
const readConf = (isJS, onPkg, file) =>
  isJS
    ? require(file)
    : R.compose(
        R.when(R.always(onPkg), R.prop('chimi')),
        JSON.parse,
        fs.readFileSync
      )(file)

// getConfig :: String -> Object
function getConfig(file) {
  const onPkg = /package\.json$/.test(file)
  const isJS = /js$/.test(file)

  const f = path.resolve(process.cwd(), file)

  const conf = fs.existsSync(f)
    ? Either.Right(readConf(isJS, onPkg, f))
    : Either.Left(`File ${f} does not exist`)

  return conf.map(R.merge(defaults))
}

module.exports = getConfig
