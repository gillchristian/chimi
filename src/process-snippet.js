const { SourceMapConsumer, SourceMapGenerator } = require('source-map')
const debug = require('debug')('chimi')

const injectDependencies = require('./transformers/inject-dependencies')
const importToRequire = require('./transformers/import-to-require')

const sourceMapsPrefix =
  '//# sourceMappingURL=data:application/json;charset=utf-8;base64,'

const mergeMaps = (m1, m2) => {
  if (!m1) {
    return m2
  }

  const map = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(m2))
  map.applySourceMap(new SourceMapConsumer(m1))
  return map.toJSON()
}

/**
 * Take a string with code and a list of transformers and return the
 * transformed code and the composed sourcemaps
 */
const applyTransforms = (filename, inputCode, transformers) => {
  const finalResult = transformers.reduce(
    (previousResult, transformer) => {
      if (previousResult.code === null) {
        return previousResult
      }

      const result = transformer(filename, previousResult.code)

      if (result.code === null) {
        return result
      }

      return {
        code: result.code,
        map: mergeMaps(previousResult.map, result.map),
      }
    },
    {
      code: inputCode,
      map: null,
    }
  )

  return finalResult
}

const addInlineSourcemap = (code, map) => {
  debug(`addInlineSourcemap(%o, %o)`, code, map)
  const sourceMapsBase64 = Buffer.from(JSON.stringify(map)).toString('base64')
  const sourceMapsInline = `${sourceMapsPrefix}${sourceMapsBase64}`

  const transformedCode = `${code}\n${sourceMapsInline}`

  return transformedCode
}

const processSnippet = (file, code, position, deps, globals) => {
  const injectDependenciesTransformer = injectDependencies(
    position,
    deps,
    globals
  )
  const importToRequireTransformer = importToRequire()

  const result = applyTransforms(file, code, [
    injectDependenciesTransformer,
    importToRequireTransformer,
  ])

  debug('Processed snippet, result: %o', result)
  if (result.error) {
    // This is a (hopefully) temporary hack, we should handle
    // parsing errors in another way
    return `throw new Error(${result.error.toString()})`
  }

  return addInlineSourcemap(result.code, result.map)
}

module.exports = {
  processSnippet,
  applyTransforms,
}
