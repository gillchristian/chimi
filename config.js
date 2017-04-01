const fs       = require('fs')
const defaults = require('./defaults')

function getConfig() {
  return fs.existsSync('.snipperrc') ? JSON.parse(fs.readFileSync('.snipperrc')) : defaults;
}

module.exports = getConfig();
