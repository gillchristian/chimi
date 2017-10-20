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

      const expectationsFile = path.join(fixtureDir, 'expectations.json')
      const expectations = JSON.parse(fs.readFileSync(expectationsFile))

      const execution = shell.exec(`node ${chimiBin}`, { silent: true })
      const { code, stdout } = execution

      expect(code).toEqual(expectations.status)
      expect(stdout).toMatchSnapshot()
    })
  }
})
