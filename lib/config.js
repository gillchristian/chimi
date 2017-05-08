const fs = require('fs')
const path = require('path')

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

  const conf = fs.existsSync(f) ? readConf(isJS, onPkg, f) : {}

  return R.merge(defaults, conf)
}

module.exports = getConfig
