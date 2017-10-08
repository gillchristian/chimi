const { create, env } = require('sanctuary')
const flutureEnv = require('fluture-sanctuary-types').env

const S = create({
  checkTypes: true,
  env: env.concat(flutureEnv),
})

module.exports = S
