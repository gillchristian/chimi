// Run snippet in another process. Return promise with status code, stdout and stderr

const exec = require('child_process').exec
const fs = require('fs')

const R = require('ramda')
const Future = require('fluture')

// sanctuary with Fluture types added
const S = require('./sanctuary')

// validateResult :: Int -> String -> String -> Bool
const validateResult = (code, signal, stderr) =>
  code === 0 && !signal && stderr.length === 0

// Result :: { id: String, ok: Bool, code: Int, signal: String, stdout: String, stderr: String }
// FileResult :: { file: String, results: [Result] }

// runSnippet :: Int -> Snippet -> Future(Result)
const runSnippet = R.curry(_runSnippet)
function _runSnippet(timeout, { value, id }) {
  const fileName = `snippet-${Math.random()}.js`

  fs.writeFileSync(fileName, value)

  const child = exec(`node ${fileName}`)

  let stdout = ''
  child.stdout.on('data', data => (stdout += data))

  let stderr = ''
  child.stderr.on('data', data => (stderr += data))

  const timeoutID = setTimeout(() => {
    child.kill('SIGKILL')
  }, timeout)

  return Future((reject, resolve) => {
    child.on('exit', (code, signal) => {
      clearTimeout(timeoutID)

      // the async version requires a callback, and
      // providing one makes the process to never exit
      fs.unlinkSync(fileName)

      resolve({
        id,
        ok: validateResult(code, signal, stderr),
        code,
        signal,
        stdout,
        stderr,
        timeout: signal === 'SIGKILL',
      })
    })
  })
}

// runSnippets :: Int -> FileN -> Future(FileResult)
const runSnippets = (timeout, { file, snippets }) =>
  S.compose(
    S.map(snippets => ({ file, snippets })),
    S.traverse(Future, runSnippet(timeout))
  )(snippets)

module.exports = R.curry(runSnippets)
