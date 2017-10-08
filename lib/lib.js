const fs = require('fs')
const R = require('ramda')
const Task = require('data.task')
const { extract } = require('chipa')
const { List } = require('immutable-ext')

const { readFile, taskify } = require('./utils')
const runSnippets = require('./run-snippet')

const extractT = taskify(extract)

// requireWithAssignment :: String -> String -> String
const requireWithAssignment = (path, name) => `let ${name} = require('${path}')`

// simpleRequire :: String -> String
const simpleRequire = path => `require('${path}')`

// buildRequireExpression :: String -> String -> String
const buildRequireExpression = R.ifElse(
  (_, value) => Boolean(value),
  requireWithAssignment,
  simpleRequire
)

// listDependencies :: Object -> String
const listDependencies = deps =>
  Object.keys(deps)
    .map(key => buildRequireExpression(key, deps[key]))
    .map(r => r + ';')
    .join('\n')

// injectDependencies :: Object -> String -> String
const injectDependencies = (deps, code) =>
  R.isEmpty(deps) || !deps
    ? code
    : ['// snippet dependencies', listDependencies(deps), code].join('\n')

const mapWithIndex = R.addIndex(R.map)

// SnippetData :: { value: String, meta: String, ... }
// Snippet     :: { value: String, meta: String, id: Int }
// File  :: { file: String, snippets: [SnippetData], ... }
// FileN :: { file: String, snippets: List(Snippet) }

// traverseFiles :: Int -> List(FileN) -> Task(List(FileResult))
const traverseFiles = timeout => snippets =>
  snippets.traverse(Task.of, runSnippets(timeout))

// normalizeSnippets :: Object -> [SnippetData] -> [Snippet]
const normalizeSnippets = deps =>
  mapWithIndex(({ value, meta }, id) => ({
    value: injectDependencies(deps, value),
    meta,
    id,
  }))

// normalizeFiles :: Object -> [File] -> [FileN]
const normalizeFiles = deps =>
  R.map(({ file, snippets }) => ({
    file,
    snippets: List(normalizeSnippets(deps)(snippets)),
  }))

// GlobPattern :: String
// @link: https://github.com/isaacs/node-glob#glob-primer

// taskOfSnippets :: Object -> Int -> GlobPattern -> Task(List(FileResult))
const taskOfSnippets = (dependencies, timeout, glob) =>
  extractT(glob, ['js', 'javascript'])
    .map(files => {
      return files.map(file => {
        // Skip snippets with `(skip)` in their metadata
        const skipRegex = /\(\s*skip\s*\)/
        file.snippets = file.snippets.filter(x => !skipRegex.test(x.meta))
        return file
      })
    })
    .map(normalizeFiles(dependencies))
    .map(List)
    .chain(traverseFiles(timeout))

module.exports = {
  injectDependencies,
  taskOfSnippets,
}
