const fs = require('fs')
const path = require('path')

const chalk = require('chalk')
const R = require('ramda')

// sanctuary with Fluture types added
const S = require('./sanctuary')
const defaults = require('./defaults')

// notExistMsg :: String -> String -> String
const notExistMsg = (p, f) =>
  `File ${p.replace(f, chalk.bold.white(f))} does not exist`

// readConf :: Bool -> Bool -> String -> Object
const readConf = (isJS, fromPkg, file) =>
  isJS
    ? require(file)
    : R.compose(
        R.when(R.always(fromPkg), R.prop('chimi')),
        JSON.parse,
        fs.readFileSync
      )(file)

// getConfig :: String -> Either(String, ChimiConfig)
function getConfig(file) {
  const fromPkg = /package\.json$/.test(file)
  const isJS = /js$/.test(file)

  const f = path.resolve(process.cwd(), file)

  const conf = fs.existsSync(f)
    ? S.Right(readConf(isJS, fromPkg, f))
    : file === '.chimirc' ? S.Right({}) : S.Left(notExistMsg(f, file))

  return S.map(R.merge(defaults), conf)
}

module.exports = getConfig
