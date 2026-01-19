'use strict'

const test = require('brittle')
const arrayObjCalc = require('../../ops/array_obj_calc.js')
const groupMultipleStats = require('../../ops/group_multiple_stats.js')

test('arrayObjCalc: should initialize with empty object', (t) => {
  const op = {
    src: 'items',
    objOps: [
      { src: 'value', op: 'sum' }
    ]
  }
  const entry = {
    items: [
      { value: 10 },
      { value: 20 }
    ]
  }
  const result = arrayObjCalc.calc(op, null, entry, {})
  t.is(result.res.value, 30) // sum of 10 + 20
})

test('arrayObjCalc: should calculate stats for array of objects', (t) => {
  const op = {
    src: 'items',
    objOps: [
      { src: 'value', op: 'sum' },
      { src: 'count', op: 'cnt' }
    ]
  }
  let cur = null
  cur = arrayObjCalc.calc(op, cur, {
    items: [
      { value: 10, count: 1 },
      { value: 20, count: 1 }
    ]
  }, {})
  cur = arrayObjCalc.calc(op, cur, {
    items: [
      { value: 5, count: 1 }
    ]
  }, {})
  t.is(cur.res.value, 35) // 10 + 20 + 5
  t.is(cur.res.count, 3) // 1 + 1 + 1
})

test('arrayObjCalc: should handle empty array', (t) => {
  const op = {
    src: 'items',
    objOps: [
      { src: 'value', op: 'sum' }
    ]
  }
  const cur = { res: { value: 10 } }
  const result = arrayObjCalc.calc(op, cur, {
    items: []
  }, {})
  t.is(result.res.value, 10)
})

test('arrayObjCalc: should handle null/undefined array', (t) => {
  const op = {
    src: 'items',
    objOps: [
      { src: 'value', op: 'sum' }
    ]
  }
  const cur = { res: { value: 10 } }
  const result = arrayObjCalc.calc(op, cur, {
    items: null
  }, {})
  t.is(result.res.value, 10)
})

test('arrayObjCalc: should skip objects with missing values', (t) => {
  const op = {
    src: 'items',
    objOps: [
      { src: 'value', op: 'sum' }
    ]
  }
  let cur = null
  cur = arrayObjCalc.calc(op, cur, {
    items: [
      { value: 10 },
      { value: null },
      { value: 20 }
    ]
  }, {})
  t.is(cur.res.value, 30) // only 10 + 20
})

test('arrayObjCalc: should handle null entry', (t) => {
  const op = {
    src: 'items',
    objOps: [
      { src: 'value', op: 'sum' }
    ]
  }
  const cur = { res: { value: 10 } }
  const result = arrayObjCalc.calc(op, cur, null, {})
  t.is(result.res.value, 10)
})

test('arrayObjCalc: should respect filter', (t) => {
  const op = {
    src: 'items',
    objOps: [
      { src: 'value', op: 'sum' }
    ],
    filter: (entry) => entry.active
  }
  let cur = null
  cur = arrayObjCalc.calc(op, cur, {
    items: [{ value: 10 }],
    active: false
  }, {})
  cur = arrayObjCalc.calc(op, cur, {
    items: [{ value: 20 }],
    active: true
  }, {})
  t.is(cur.res.value, 20)
})

test('groupMultipleStats: should initialize with empty object', (t) => {
  const op = {
    srcs: [
      { name: 'value', src: 'value' },
      { name: 'count', src: 'count' }
    ],
    group: (entry, ext) => ext.category
  }
  const entry = {
    value: 10,
    count: 5
  }
  const result = groupMultipleStats.calc(op, null, entry, { category: 'A' })
  t.is(result.res.A.value, 10)
  t.is(result.res.A.count, 5)
})

test('groupMultipleStats: should group multiple stats', (t) => {
  const op = {
    srcs: [
      { name: 'value', src: 'value' },
      { name: 'count', src: 'count' }
    ],
    group: (entry, ext) => ext.category
  }
  let cur = null
  cur = groupMultipleStats.calc(op, cur, {
    value: 10,
    count: 5
  }, { category: 'A' })
  cur = groupMultipleStats.calc(op, cur, {
    value: 20,
    count: 3
  }, { category: 'B' })
  cur = groupMultipleStats.calc(op, cur, {
    value: 15,
    count: 2
  }, { category: 'A' })
  t.is(cur.res.A.value, 15) // last value for A
  t.is(cur.res.A.count, 2) // last count for A
  t.is(cur.res.B.value, 20)
  t.is(cur.res.B.count, 3)
})

test('groupMultipleStats: should handle null entry', (t) => {
  const op = {
    srcs: [
      { name: 'value', src: 'value' }
    ],
    group: (entry, ext) => ext.category
  }
  const cur = { res: { A: { value: 10 } } }
  const result = groupMultipleStats.calc(op, cur, null, { category: 'A' })
  t.is(result.res.A.value, 10)
})

test('groupMultipleStats: should return early if no srcs', (t) => {
  const op = {
    group: (entry, ext) => ext.category
  }
  const cur = { res: {} }
  const result = groupMultipleStats.calc(op, cur, { value: 10 }, { category: 'A' })
  t.is(Object.keys(result.res).length, 0)
})

test('groupMultipleStats: should return early if srcs is not array', (t) => {
  const op = {
    srcs: 'not-an-array',
    group: (entry, ext) => ext.category
  }
  const cur = { res: {} }
  const result = groupMultipleStats.calc(op, cur, { value: 10 }, { category: 'A' })
  t.is(Object.keys(result.res).length, 0)
})

test('groupMultipleStats: should return early if no group function', (t) => {
  const op = {
    srcs: [
      { name: 'value', src: 'value' }
    ]
  }
  const cur = { res: {} }
  const result = groupMultipleStats.calc(op, cur, { value: 10 }, { category: 'A' })
  t.is(Object.keys(result.res).length, 0)
})

test('groupMultipleStats: should return early if group returns null', (t) => {
  const op = {
    srcs: [
      { name: 'value', src: 'value' }
    ],
    group: (entry, ext) => null
  }
  const cur = { res: {} }
  const result = groupMultipleStats.calc(op, cur, { value: 10 }, {})
  t.is(Object.keys(result.res).length, 0)
})

test('groupMultipleStats: should respect filter', (t) => {
  const op = {
    srcs: [
      { name: 'value', src: 'value' }
    ],
    group: (entry, ext) => ext.category,
    filter: (entry) => entry.active
  }
  let cur = null
  cur = groupMultipleStats.calc(op, cur, {
    value: 10,
    active: false
  }, { category: 'A' })
  cur = groupMultipleStats.calc(op, cur, {
    value: 20,
    active: true
  }, { category: 'A' })
  t.is(cur.res.A.value, 20)
})
