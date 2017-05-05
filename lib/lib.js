const fs = require('fs')
const R = require('ramda')
const Task = require('data.task')
const { extract } = require('chipa')
const { List } = require('immutable-ext')
const { stripIndent } = require('common-tags')

const { readFile, taskify } = require('./utils')
const config = require('./config')
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

// injectDependencies :: String -> String
const injectDependencies = code => stripIndent`
  // snippet dependencies
  ${listDependencies(config.dependencies || [])}

  ${code}
`

const mapWithIndex = R.addIndex(R.map)

// SnippetData :: { value: String, meta: String, ... }
// Snippet     :: { value: String, meta: String, id: Int }
// File  :: { file: String, snippets: [SnippetData], ... }
// FileN :: { file: String, snippets: List(Snippet) }

// traverseFiles :: Int -> List(FileN) -> Task(List(FileResult))
const traverseFiles = timeout => snippets =>
  snippets.traverse(Task.of, runSnippets(timeout))

// normalizeSnippets :: [SnippetData] -> [Snippet]
const normalizeSnippets = mapWithIndex(({ value, meta }, id) => ({
  value: injectDependencies(value),
  meta,
  id,
}))

// normalizeFiles :: [File] -> [FileN]
const normalizeFiles = R.map(({ file, snippets }) => ({
  file,
  snippets: List(normalizeSnippets(snippets)),
}))

// GlobPattern :: String
// @link: https://github.com/isaacs/node-glob#glob-primer

// taskOfSnippets :: Int -> GlobPattern -> Task(List(FileResult))
const taskOfSnippets = (timeout, glob) =>
  extractT(glob, ['js', 'javascript'])
    .map(normalizeFiles)
    .map(List)
    .chain(traverseFiles(timeout))

module.exports = { taskOfSnippets }
