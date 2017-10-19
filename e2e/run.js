const fs = require('fs')
const path = require('path')

const shell = require('shelljs')
const expect = require('chai').expect

const chimiBin = path.resolve(__dirname, '..', 'bin', 'bin.js')
const fixturesRoot = path.join(__dirname, 'fixtures')

const fixturesDirs = fs
  .readdirSync(fixturesRoot)
  .map(x => path.join(fixturesRoot, x))
  .filter(x => fs.lstatSync(x).isDirectory())

for (let fixtureDir of fixturesDirs) {
  shell.cd(fixtureDir)

  const execution = shell.exec(`node ${chimiBin}`, { silent: true })
  const expectedStdout = fs
    .readFileSync(path.join(fixtureDir, 'output.txt'))
    .toString()
  const expectedStatus = Number(
    fs
      .readFileSync(path.join(fixtureDir, 'status.txt'))
      .toString()
      .trim()
  )

  expect(execution.stdout).to.equal(expectedStdout)
  expect(execution.code).to.equal(expectedStatus)
}
