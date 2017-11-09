const { stripIndent } = require('common-tags')
const {
  injectDependencies,
  listDependencies,
} = require('../lib/process-snippet')

describe('src/process-snippets', () => {
  describe('listDependencies', () => {
    const dependencies = [
      'trae',
      { module: 'es6-promise' },
      { name: '_', module: 'lodash' },
      { name: 'config', module: './config', type: 'let' },
    ]

    it('should list dependencies in different types', () => {
      expect(listDependencies(dependencies)).toMatchSnapshot()
    })
  })

  describe('injectDependencies', () => {
    const code = stripIndent`
      const answer = 42

      console.log(answer)
    `

    const position = {
      start: { line: 0, column: 0 },
    }

    it('should add source maps but no dependencies', () => {
      const result = injectDependencies('README.md', code, position, [], {})

      expect(result).toMatchSnapshot()
    })

    it('should not change snippet indentation', () => {
      const withIndentation = stripIndent`
        const foo = {
          bar: "bar"
        };

        Promise.resolve(foo)
          .then(({ bar }) => bar)
          .then(bar => {
            console.log(bar);
          });
      `
      let result = injectDependencies(
        'README.md',
        withIndentation,
        position,
        [],
        {}
      )

      expect(result).toMatchSnapshot()

      const dependencies = [
        {
          name: '_',
          module: 'lodash',
        },
        {
          name: 'lib',
          module: './lib',
        },
      ]
      result = injectDependencies(
        'README.md',
        withIndentation,
        position,
        dependencies,
        {}
      )

      expect(result).toMatchSnapshot()
    })

    it('should prepend requires with variable declarations to the snippet code', () => {
      let dependencies = [
        {
          name: '_',
          module: 'lodash',
        },
      ]
      let result = injectDependencies(
        'README.md',
        code,
        position,
        dependencies,
        {}
      )

      expect(result).toMatchSnapshot()

      dependencies = [
        {
          name: '_',
          module: 'lodash',
        },
        'trae',
      ]
      result = injectDependencies('README.md', code, position, dependencies, {})

      expect(result).toMatchSnapshot()
    })

    it('should work for local dependencies', () => {
      const dependencies = [
        {
          name: 'lib',
          module: './lib',
        },
        {
          name: 'bar',
          module: '../foo/bar',
        },
      ]
      const result = injectDependencies(
        'README.md',
        code,
        position,
        dependencies,
        {}
      )

      expect(result).toMatchSnapshot()
    })

    it('should add requires with no declaration when the name is missing', () => {
      const dependencies = [
        {
          module: './for-the-side-effects',
        },
        {
          module: 'es6-promise',
        },
      ]
      const result = injectDependencies(
        'README.md',
        code,
        position,
        dependencies,
        {}
      )

      expect(result).toMatchSnapshot()
    })

    it('should add globals', () => {
      const globals = {
        theAnswer: 42,
      }
      const result = injectDependencies(
        'README.md',
        code,
        position,
        [],
        globals
      )

      expect(result).toMatchSnapshot()
    })

    it('should add globals and dependencies', () => {
      const dependencies = [
        {
          name: '_',
          module: 'lodash',
        },
      ]
      const globals = {
        theAnswer: 42,
      }
      const result = injectDependencies(
        'README.md',
        code,
        position,
        dependencies,
        globals
      )

      expect(result).toMatchSnapshot()
    })

    it('should interpolate functions, arrays, objets and strings properly', () => {
      const globals = {
        add: '(a, b) => a + b',
        message: "'hello world'",
        foo: "{ foo: 'bar' }",
        fruits: "['orange', 'apple']",
      }
      const result = injectDependencies(
        'README.md',
        code,
        position,
        [],
        globals
      )

      expect(result).toMatchSnapshot()
    })
  })
})
