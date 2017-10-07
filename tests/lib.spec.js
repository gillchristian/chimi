const { stripIndent } = require('common-tags')
const { injectDependencies } = require('../lib/lib')

describe('lib', () => {
  describe('injectDependencies', () => {
    const code = stripIndent`
      const answer = 42

      console.log(answer)
    `

    test('no dependencies', () => {
      const dependencies = {}
      const result = injectDependencies(dependencies, code)

      expect(result).toMatchSnapshot()
    })

    test('one dependency', () => {
      const dependencies = {
        lodash: '_',
      }
      const result = injectDependencies(dependencies, code)

      expect(result).toMatchSnapshot()
    })

    test('two dependencies', () => {
      const dependencies = {
        lodash: '_',
        trae: 'trae',
      }
      const result = injectDependencies(dependencies, code)

      expect(result).toMatchSnapshot()
    })

    test('local dependency', () => {
      const dependencies = {
        './lib': 'lib',
      }
      const result = injectDependencies(dependencies, code)

      expect(result).toMatchSnapshot()
    })
  })
})
