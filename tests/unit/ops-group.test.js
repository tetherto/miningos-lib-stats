'use strict'

const test = require('brittle')
const groupSum = require('../../ops/group_sum.js')
const groupAvg = require('../../ops/group_avg.js')
const groupCnt = require('../../ops/group_cnt.js')
const groupMax = require('../../ops/group_max.js')

test('groupSum: should initialize with empty object', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  const result = groupSum.calc(op, null, { value: 10 }, { category: 'A' })
  t.is(result.res.A, 10)
})

test('groupSum: should sum values by group', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  let cur = null
  cur = groupSum.calc(op, cur, { value: 10 }, { category: 'A' })
  cur = groupSum.calc(op, cur, { value: 20 }, { category: 'A' })
  cur = groupSum.calc(op, cur, { value: 30 }, { category: 'B' })
  t.is(cur.res.A, 30)
  t.is(cur.res.B, 30)
})

test('groupSum: should handle null entry', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  const cur = { res: { A: 10 } }
  const result = groupSum.calc(op, cur, null, { category: 'A' })
  t.is(result.res.A, 10)
})

test('groupSum: should respect filter', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category,
    filter: (entry) => entry.value > 10
  }
  let cur = null
  cur = groupSum.calc(op, cur, { value: 5 }, { category: 'A' })
  cur = groupSum.calc(op, cur, { value: 15 }, { category: 'A' })
  t.is(cur.res.A, 15)
})

test('groupSum: should return early if no group function', (t) => {
  const op = {
    src: 'value'
  }
  const cur = { res: {} }
  const result = groupSum.calc(op, cur, { value: 10 }, { category: 'A' })
  t.is(Object.keys(result.res).length, 0)
})

test('groupAvg: should initialize with empty object', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  const result = groupAvg.calc(op, null, { value: 10 }, { category: 'A' })
  t.is(result.res.A.acc, 10)
  t.is(result.res.A.cnt, 1)
})

test('groupAvg: should accumulate values by group', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  let cur = null
  cur = groupAvg.calc(op, cur, { value: 10 }, { category: 'A' })
  cur = groupAvg.calc(op, cur, { value: 20 }, { category: 'A' })
  cur = groupAvg.calc(op, cur, { value: 30 }, { category: 'B' })
  t.is(cur.res.A.acc, 30)
  t.is(cur.res.A.cnt, 2)
  t.is(cur.res.B.acc, 30)
  t.is(cur.res.B.cnt, 1)
})

test('groupAvg: should calculate averages in tally', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  const cur = {
    res: {
      A: { acc: 30, cnt: 2, res: 0 },
      B: { acc: 30, cnt: 1, res: 0 }
    }
  }
  const result = groupAvg.tally(op, cur)
  t.is(result.res.A, 15)
  t.is(result.res.B, 30)
})

test('groupAvg: should handle zero count in tally', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  const cur = {
    res: {
      A: { acc: 0, cnt: 0, res: 0 }
    }
  }
  const result = groupAvg.tally(op, cur)
  t.is(result.res.A, null)
})

test('groupAvg: should handle null entry', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  const cur = { res: { A: { acc: 10, cnt: 1, res: 0 } } }
  const result = groupAvg.calc(op, cur, null, { category: 'A' })
  t.is(result.res.A.acc, 10)
  t.is(result.res.A.cnt, 1)
})

test('groupAvg: should respect filter', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category,
    filter: (entry) => entry.value > 10
  }
  let cur = null
  cur = groupAvg.calc(op, cur, { value: 5 }, { category: 'A' })
  cur = groupAvg.calc(op, cur, { value: 15 }, { category: 'A' })
  t.is(cur.res.A.cnt, 1)
  t.is(cur.res.A.acc, 15)
})

test('groupCnt: should initialize with empty object', (t) => {
  const op = {
    group: (entry, ext) => ext.category
  }
  const result = groupCnt.calc(op, null, {}, { category: 'A' })
  t.is(result.res.A, 1)
})

test('groupCnt: should count entries by group', (t) => {
  const op = {
    group: (entry, ext) => ext.category
  }
  let cur = null
  cur = groupCnt.calc(op, cur, {}, { category: 'A' })
  cur = groupCnt.calc(op, cur, {}, { category: 'A' })
  cur = groupCnt.calc(op, cur, {}, { category: 'B' })
  t.is(cur.res.A, 2)
  t.is(cur.res.B, 1)
})

test('groupCnt: should handle null entry', (t) => {
  const op = {
    group: (entry, ext) => ext.category
  }
  const cur = { res: { A: 1 } }
  const result = groupCnt.calc(op, cur, null, { category: 'A' })
  t.is(result.res.A, 1)
})

test('groupCnt: should respect filter', (t) => {
  const op = {
    group: (entry, ext) => ext.category,
    filter: (entry) => entry.value > 10
  }
  let cur = null
  cur = groupCnt.calc(op, cur, { value: 5 }, { category: 'A' })
  cur = groupCnt.calc(op, cur, { value: 15 }, { category: 'A' })
  t.is(cur.res.A, 1)
})

test('groupCnt: should return early if no group function', (t) => {
  const op = {}
  const cur = { res: {} }
  const result = groupCnt.calc(op, cur, {}, { category: 'A' })
  t.is(Object.keys(result.res).length, 0)
})

test('groupMax: should initialize with empty object', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  const result = groupMax.calc(op, null, { value: 10 }, { category: 'A' })
  t.is(result.res.A, 10)
})

test('groupMax: should find max value by group', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  let cur = null
  cur = groupMax.calc(op, cur, { value: 10 }, { category: 'A' })
  cur = groupMax.calc(op, cur, { value: 30 }, { category: 'A' })
  cur = groupMax.calc(op, cur, { value: 20 }, { category: 'A' })
  cur = groupMax.calc(op, cur, { value: 50 }, { category: 'B' })
  t.is(cur.res.A, 30)
  t.is(cur.res.B, 50)
})

test('groupMax: should handle null entry', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  const cur = { res: { A: 10 } }
  const result = groupMax.calc(op, cur, null, { category: 'A' })
  t.is(result.res.A, 10)
})

test('groupMax: should respect filter', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category,
    filter: (entry) => entry.value > 10
  }
  let cur = null
  cur = groupMax.calc(op, cur, { value: 5 }, { category: 'A' })
  cur = groupMax.calc(op, cur, { value: 15 }, { category: 'A' })
  t.is(cur.res.A, 15)
})

test('groupMax: should handle zero values', (t) => {
  const op = {
    src: 'value',
    group: (entry, ext) => ext.category
  }
  let cur = null
  cur = groupMax.calc(op, cur, { value: 0 }, { category: 'A' })
  cur = groupMax.calc(op, cur, { value: -5 }, { category: 'A' })
  t.is(cur.res.A, 0)
})

test('groupMax: should return early if no group function', (t) => {
  const op = {
    src: 'value'
  }
  const cur = { res: {} }
  const result = groupMax.calc(op, cur, { value: 10 }, { category: 'A' })
  t.is(Object.keys(result.res).length, 0)
})
