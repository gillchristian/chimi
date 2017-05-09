// Run snippet in another process. Return promise with status code, stdout and stderr

const exec = require('child_process').exec

const R = require('ramda')
const Task = require('data.task')

// validateResult :: Int -> String -> String -> Bool
const validateResult = (code, signal, stderr) =>
  code === 0 && !signal && stderr.length === 0

// Result :: { id: String, ok: Bool, code: Int, signal: String, stdout: String, stderr: String }
// FileResult :: { file: String, results: List(Result) }

// runSnippet :: Int -> Snippet -> Task(Result)
const runSnippet = R.curry(_runSnippet)
function _runSnippet(timeout, { value, id }) {
  const child = exec('node')

  let stdout = ''
  child.stdout.on('data', data => (stdout += data))

  let stderr = ''
  child.stderr.on('data', data => (stderr += data))

  return new Task((reject, resolve) => {
    const t = setTimeout(() => {
      child.kill('SIGKILL')
    }, timeout)

    child.on('exit', (code, signal) => {
      clearTimeout(t)
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

    child.stdin.write(value)
    child.stdin.end()
  })
}

// runSnippets :: Int -> FileN -> Task(FileResult)
function runSnippets(timeout, { file, snippets }) {
  return snippets
    .traverse(Task.of, runSnippet(timeout))
    .map(s => ({ file, snippets: s }))
}

module.exports = R.curry(runSnippets)
