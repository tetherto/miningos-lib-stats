'use strict'

const test = require('brittle')
const avg = require('../../ops/avg.js')
const sum = require('../../ops/sum.js')
const cnt = require('../../ops/cnt.js')
const group = require('../../ops/group.js')

test('avg: should initialize with zero values', (t) => {
  const op = { src: 'value' }
  const result = avg.calc(op, null, { value: 10 }, {})
  t.is(result.acc, 10)
  t.is(result.cnt, 1)
})

test('avg: should accumulate values', (t) => {
  const op = { src: 'value' }
  let cur = null
  cur = avg.calc(op, cur, { value: 10 }, {})
  cur = avg.calc(op, cur, { value: 20 }, {})
  cur = avg.calc(op, cur, { value: 30 }, {})
  t.is(cur.acc, 60)
  t.is(cur.cnt, 3)
})

test('avg: should calculate average in tally', (t) => {
  const op = { src: 'value' }
  const cur = { acc: 60, cnt: 3, res: 0 }
  const result = avg.tally(op, cur)
  t.is(result.res, 20)
})

test('avg: should return zero when count is zero in tally', (t) => {
  const op = { src: 'value' }
  const cur = { acc: 0, cnt: 0, res: 0 }
  const result = avg.tally(op, cur)
  t.is(result.res, 0)
})

test('avg: should handle null entry', (t) => {
  const op = { src: 'value' }
  const cur = { acc: 10, cnt: 1, res: 0 }
  const result = avg.calc(op, cur, null, {})
  t.is(result.acc, 10)
  t.is(result.cnt, 1)
})

test('avg: should respect filter', (t) => {
  const op = {
    src: 'value',
    filter: (entry) => entry.value > 10
  }
  let cur = null
  cur = avg.calc(op, cur, { value: 5 }, {})
  cur = avg.calc(op, cur, { value: 15 }, {})
  t.is(cur.cnt, 1)
  t.is(cur.acc, 15)
})

test('avg: should handle missing values', (t) => {
  const op = { src: 'value' }
  let cur = null
  cur = avg.calc(op, cur, { value: 10 }, {})
  cur = avg.calc(op, cur, {}, {})
  t.is(cur.acc, 10)
  t.is(cur.cnt, 2)
})

test('sum: should initialize with zero', (t) => {
  const op = { src: 'value' }
  const result = sum.calc(op, null, { value: 10 }, {})
  t.is(result.res, 10)
})

test('sum: should accumulate values', (t) => {
  const op = { src: 'value' }
  let cur = null
  cur = sum.calc(op, cur, { value: 10 }, {})
  cur = sum.calc(op, cur, { value: 20 }, {})
  cur = sum.calc(op, cur, { value: 30 }, {})
  t.is(cur.res, 60)
})

test('sum: should handle null entry', (t) => {
  const op = { src: 'value' }
  const cur = { res: 10 }
  const result = sum.calc(op, cur, null, {})
  t.is(result.res, 10)
})

test('sum: should respect filter', (t) => {
  const op = {
    src: 'value',
    filter: (entry, ext) => entry.value > 10
  }
  let cur = null
  cur = sum.calc(op, cur, { value: 5 }, {})
  cur = sum.calc(op, cur, { value: 15 }, {})
  t.is(cur.res, 15)
})

test('sum: should handle missing values', (t) => {
  const op = { src: 'value' }
  let cur = null
  cur = sum.calc(op, cur, { value: 10 }, {})
  cur = sum.calc(op, cur, {}, {})
  t.is(cur.res, 10)
})

test('cnt: should initialize with zero', (t) => {
  const op = {}
  const result = cnt.calc(op, null, {}, {})
  t.is(result.res, 1)
})

test('cnt: should count entries', (t) => {
  const op = {}
  let cur = null
  cur = cnt.calc(op, cur, {}, {})
  cur = cnt.calc(op, cur, {}, {})
  cur = cnt.calc(op, cur, {}, {})
  t.is(cur.res, 3)
})

test('cnt: should respect filter', (t) => {
  const op = {
    filter: (entry) => entry.value > 10
  }
  let cur = null
  cur = cnt.calc(op, cur, { value: 5 }, {})
  cur = cnt.calc(op, cur, { value: 15 }, {})
  t.is(cur.res, 1)
})

test('group: should initialize with empty object', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  const result = group.calc(op, null, { value: 10 }, { category: 'A' })
  t.is(result.res.A, 10)
})

test('group: should group values by category', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  let cur = null
  cur = group.calc(op, cur, { value: 10 }, { category: 'A' })
  cur = group.calc(op, cur, { value: 20 }, { category: 'B' })
  cur = group.calc(op, cur, { value: 30 }, { category: 'A' })
  t.is(cur.res.A, 30)
  t.is(cur.res.B, 20)
})

test('group: should handle null entry', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  const cur = { res: { A: 10 } }
  const result = group.calc(op, cur, null, { category: 'A' })
  t.is(result.res.A, 10)
})

test('group: should return early if no src', (t) => {
  const op = {
    group: (entry, ext) => ext.category
  }
  const cur = { res: {} }
  const result = group.calc(op, cur, { value: 10 }, { category: 'A' })
  t.is(Object.keys(result.res).length, 0)
})

test('group: should return early if no group function', (t) => {
  const op = {
    src: 'value'
  }
  const cur = { res: {} }
  const result = group.calc(op, cur, { value: 10 }, { category: 'A' })
  t.is(Object.keys(result.res).length, 0)
})

test('group: should return early if group returns null', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => null
  }
  const cur = { res: {} }
  const result = group.calc(op, cur, { value: 10 }, {})
  t.is(Object.keys(result.res).length, 0)
})

test('group: should respect filter', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category,
    filter: (entry) => entry.value > 10
  }
  let cur = null
  cur = group.calc(op, cur, { value: 5 }, { category: 'A' })
  cur = group.calc(op, cur, { value: 15 }, { category: 'A' })
  t.is(cur.res.A, 15)
})
