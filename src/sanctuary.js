const R = require('ramda')
const { create, env } = require('sanctuary')
const { NullaryType } = require('sanctuary-def')

const isString = R.is(String)
const isObject = R.is(Object)

const propIsString = prop => R.compose(isString, R.prop(prop))
const optionalPropIsString = prop =>
  R.ifElse(R.has(prop), propIsString(prop), R.T)

const checkProps = R.allPass([
  propIsString('module'),
  optionalPropIsString('name'),
  optionalPropIsString('type'),
])

const isDepObject = R.both(isObject, checkProps)

const isDep = R.either(isString, isDepObject)

const chimiDependency = NullaryType('chimi/Dependency', '#', isDep)

const S = create({
  checkTypes: true,
  env: env.concat([chimiDependency]),
})

module.exports = S
