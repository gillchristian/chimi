const R = require('ramda')
const Future = require('fluture')
const { extract } = require('chipa')
const { SourceMapGenerator } = require('source-map')

// sanctuary with Fluture types added
const S = require('./sanctuary')
const { taskify } = require('./utils')
const runSnippets = require('./run-snippet')

const appendSemi = r => `${r};`

// requireWithAssignment :: String -> String -> String
const requireWithAssignment = (name, module, type = 'const') =>
  `${type} ${name} = require('${module || name}')`

// simpleRequire :: String -> String
const simpleRequire = module => `require('${module}')`

// assignmentExpression :: String -> String -> String
const assignmentExpression = (key, value) => `let ${key} = ${value}`

const handleDep = S.ifElse(
  S.is(String),
  requireWithAssignment,
  ({ name, module, type }) =>
    name ? requireWithAssignment(name, module, type) : simpleRequire(module)
)

// listDependencies :: [string|Object] -> String
const listDependencies = S.pipe([
  S.map(handleDep),
  S.map(appendSemi),
  S.joinWith('\n'),
])

// listGlobals :: Object -> String
const listGlobals = globals =>
  Object.keys(globals)
    .map(key => assignmentExpression(key, globals[key]))
    .map(appendSemi)
    .join('\n')

const generateSourceMaps = (
  file = 'snippet.js',
  code,
  position,
  dependencies,
  globals
) => {
  const source = process.env.NODE_ENV === 'dev' ? `/${file}` : file
  const decoratedCodeFirstLine =
    1 +
    1 + // require source-map-suppor
    1 + // comment
    dependencies.split('\n').length + // dependencies
    globals.split('\n').length + // globals
    1 // empty line

  const codeLinesCount = code.split('\n').length

  const map = new SourceMapGenerator({
    file: '/decorated-snippet.js',
  })

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < codeLinesCount; i++) {
    map.addMapping({
      generated: {
        line: decoratedCodeFirstLine + i,
        column: 0,
      },
      original: {
        line: position.start.line + i + 1,
        column: 0,
      },
      source,
    })
  }

  map.setSourceContent(source, code)

  return map.toString()
}

const sourceMapsPrefix =
  '//# sourceMappingURL=data:application/json;charset=utf-8;base64,'

// injectDependencies :: Object -> Object -> String -> String
const injectDependencies = (file, code, position, deps, globals) => {
  const depsStr = listDependencies(deps || [])
  const globalsStr = listGlobals(globals || {})
  const sourceMaps = generateSourceMaps(
    file,
    code,
    position,
    depsStr,
    globalsStr
  )
  const sourceMapsBase64 = Buffer.from(sourceMaps).toString('base64')

  const sourceMapsInline = `${sourceMapsPrefix}${sourceMapsBase64}`

  return [
    "require('source-map-support').install()",
    '// snippet dependencies',
    depsStr,
    globalsStr,
    '',
    code,
    sourceMapsInline,
  ].join('\n')
}

// SnippetData :: { value: String, meta: String, ... }
// Snippet     :: { value: String, meta: String, id: Int }
// File  :: { file: String, snippets: [SnippetData], ... }
// FileN :: { file: String, snippets: [Snippet] }

// traverseFiles :: Int -> [FileN] -> Future([FileResult])
const traverseFiles = timeout => snippets =>
  S.traverse(Future, runSnippets(timeout), snippets)

const mapWithIndex = R.addIndex(S.map)

// normalizeSnippets :: Object -> Object -> [SnippetData] -> [Snippet]
const normalizeSnippets = (file, deps, globals) =>
  mapWithIndex(({ value, meta, position }, index) => ({
    id: index,
    value: injectDependencies(file, value, position, deps, globals),
    meta,
  }))

// normalizeFiles :: Object -> Object -> [File] -> [FileN]
const normalizeFiles = (deps, globals) =>
  S.map(({ file, snippets }) => ({
    file,
    snippets: normalizeSnippets(file, deps, globals)(snippets),
  }))

// matches "(skip)"with any amount of spaces between the whitespace
const skipRegex = /\(\s*skip\s*\)/

// matchNoSkip :: Snippet -> Bool
const matchNoSkip = S.compose(S.complement(S.test(skipRegex)), S.prop('meta'))

// skips snippets with `(skip)` in their metadata
//
// skip :: [File] -> [File]
const skip = S.map(R.evolve({ snippets: S.filter(matchNoSkip) }))

// GlobPattern :: String
// @link: https://github.com/isaacs/node-glob#glob-primer

// taskOfSnippets :: Object -> Object -> Int -> GlobPattern -> Future([FileResult])
const taskOfSnippets = ({ dependencies, globals, timeout }, glob) =>
  S.pipe(
    [
      S.chain(Future.encase(skip)),
      S.chain(Future.encase(normalizeFiles(dependencies, globals))),
      S.chain(traverseFiles(timeout)),
    ],
    taskify(extract)(glob, ['js', 'javascript'])
  )

module.exports = {
  injectDependencies,
  listDependencies,
  taskOfSnippets,
}
