// Run snippet in another process. Return promise with status code, stdout and stderr

const exec = require('child_process').exec;

module.exports = function (snippet, timeout = 1000) {
  const child = exec('node')

  let stdout = ''
  child.stdout.on('data', function (data) { stdout += data })

  let stderr = ''
  child.stderr.on('data', function (data) { stderr += data })

  return new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      resolve({
        code,
        signal,
        stdout,
        stderr
      })
    })

    setTimeout(() => {
      child.kill()
    }, timeout)

    child.stdin.write(snippet)
    child.stdin.end()
  })
}
