const fs = require('fs')
const path = require('path')

const chalk = require('chalk')
const cosmiconfig = require('cosmiconfig')
const R = require('ramda')

// sanctuary with Fluture types added
const S = require('./sanctuary')
const defaults = require('./defaults')

const explorer = cosmiconfig('chimi', {
  sync: true,
})

// getConfig :: String -> ChimiConfig
function getConfig() {
  const config = S.map(S.prop('config'), S.toMaybe(explorer.load('.')))
  const mergedConfig = S.map(R.merge(defaults), config)

  return S.fromMaybe(defaults, mergedConfig)
}

module.exports = getConfig
