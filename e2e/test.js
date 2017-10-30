const fs = require('fs')
const path = require('path')

const shell = require('shelljs')

const chimiBin = path.resolve(__dirname, '..', 'bin', 'bin.js')
const fixturesRoot = path.join(__dirname, 'fixtures')

process.env.NODE_ENV = 'dev'

const fixturesDirs = fs
  .readdirSync(fixturesRoot)
  .map(x => path.join(fixturesRoot, x))
  .filter(x => fs.lstatSync(x).isDirectory())

describe('e2e tests', () => {
  // eslint-disable-next-line no-restricted-syntax,prefer-const
  for (let fixtureDir of fixturesDirs) {
    const relativeFixtureDir = path.relative(fixturesRoot, fixtureDir)

    it(`should run ${relativeFixtureDir} as expected`, () => {
      shell.cd(fixtureDir)

      // eslint-disable-next-line global-require,import/no-dynamic-require
      const expectations = require(path.join(fixtureDir, 'expectations.json'))
      const command = `${chimiBin} ${expectations.arguments || ''}`
      const { code, stdout } = shell.exec(command, { silent: true })

      expect(code).toEqual(expectations.status)
      expect(stdout).toMatchSnapshot()
    })
  }
})
