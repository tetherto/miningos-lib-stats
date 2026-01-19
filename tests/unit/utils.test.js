'use strict'

const test = require('brittle')
const { getVal, groupBy } = require('../../utils.js')

test('getVal should return null for null src', (t) => {
  const entry = { value: 10 }
  t.is(getVal(entry, null), null)
})

test('getVal should return null for undefined src', (t) => {
  const entry = { value: 10 }
  t.is(getVal(entry, undefined), null)
})

test('getVal should work with function src', (t) => {
  const entry = { value: 10 }
  const func = (e) => e.value * 2
  t.is(getVal(entry, func), 20)
})

test('getVal should work with string path src', (t) => {
  const entry = { value: 10 }
  t.is(getVal(entry, 'value'), 10)
})

test('getVal should work with nested string path', (t) => {
  const entry = { nested: { value: 42 } }
  t.is(getVal(entry, 'nested.value'), 42)
})

test('getVal should return undefined for non-existent path', (t) => {
  const entry = { value: 10 }
  t.is(getVal(entry, 'nonexistent'), undefined)
})

test('getVal should handle complex nested paths', (t) => {
  const entry = {
    level1: {
      level2: {
        level3: {
          value: 100
        }
      }
    }
  }
  t.is(getVal(entry, 'level1.level2.level3.value'), 100)
})

test('groupBy should return null when ext is null', (t) => {
  const groupFn = groupBy('field')
  const entry = {}
  t.is(groupFn(entry, null), null)
})

test('groupBy should return null when ext is undefined', (t) => {
  const groupFn = groupBy('field')
  const entry = {}
  t.is(groupFn(entry, undefined), null)
})

test('groupBy should extract value from ext using field', (t) => {
  const groupFn = groupBy('category')
  const entry = {}
  const ext = { category: 'A' }
  t.is(groupFn(entry, ext), 'A')
})

test('groupBy should work with nested paths', (t) => {
  const groupFn = groupBy('meta.group')
  const entry = {}
  const ext = { meta: { group: 'B' } }
  t.is(groupFn(entry, ext), 'B')
})

test('groupBy should return undefined for non-existent field', (t) => {
  const groupFn = groupBy('missing')
  const entry = {}
  const ext = { category: 'A' }
  t.is(groupFn(entry, ext), undefined)
})

test('groupBy should work with function field', (t) => {
  const groupFn = groupBy((ext) => ext.category)
  const entry = { type: 'test' }
  const ext = { category: 'A' }
  t.is(groupFn(entry, ext), 'A')
})
