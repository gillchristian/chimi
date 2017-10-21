const fs = require('fs')
const path = require('path')

const shell = require('shelljs')

const chimiBin = path.resolve(__dirname, '..', 'bin', 'bin.js')
const fixturesRoot = path.join(__dirname, 'fixtures')

const fixturesDirs = fs
  .readdirSync(fixturesRoot)
  .map(x => path.join(fixturesRoot, x))
  .filter(x => fs.lstatSync(x).isDirectory())

describe('e2e tests', () => {
  for (let fixtureDir of fixturesDirs) {
    const relativeFixtureDir = path.relative(fixturesRoot, fixtureDir)

    it(`should run ${relativeFixtureDir} as expected`, () => {
      shell.cd(fixtureDir)

      const expectations = require(path.join(fixtureDir, 'expectations.json'))
      const command = `${chimiBin} ${expectations.arguments || ''}`

      const { code, stdout } = shell.exec(command, { silent: true })

      expect(code).toEqual(expectations.status)
      expect(stdout).toMatchSnapshot()
    })
  }
})
