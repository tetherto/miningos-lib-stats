'use strict'

const test = require('brittle')
const arrConcat = require('../../ops/arr_concat.js')
const objConcat = require('../../ops/obj_concat.js')
const nestedObjConcat = require('../../ops/nested_obj_concat.js')

test('arrConcat: should initialize with empty array', (t) => {
  const op = {
    src: 'items'
  }
  const entry = {
    items: [1, 2, 3]
  }
  const result = arrConcat.calc(op, null, entry, {})
  t.alike(result.res, [1, 2, 3])
})

test('arrConcat: should concatenate arrays', (t) => {
  const op = {
    src: 'items'
  }
  let cur = null
  cur = arrConcat.calc(op, cur, {
    items: [1, 2]
  }, {})
  cur = arrConcat.calc(op, cur, {
    items: [3, 4]
  }, {})
  t.alike(cur.res, [1, 2, 3, 4])
})

test('arrConcat: should handle null entry', (t) => {
  const op = {
    src: 'items'
  }
  const cur = { res: [1, 2] }
  const result = arrConcat.calc(op, cur, null, {})
  t.alike(result.res, [1, 2])
})

test('arrConcat: should handle null/undefined values', (t) => {
  const op = {
    src: 'items'
  }
  let cur = null
  cur = arrConcat.calc(op, cur, {
    items: [1, 2]
  }, {})
  cur = arrConcat.calc(op, cur, {
    items: null
  }, {})
  cur = arrConcat.calc(op, cur, {
    items: [3, 4]
  }, {})
  t.alike(cur.res, [1, 2, 3, 4])
})

test('arrConcat: should respect filter', (t) => {
  const op = {
    src: 'items',
    filter: (entry) => entry.active
  }
  let cur = null
  cur = arrConcat.calc(op, cur, {
    items: [1, 2],
    active: false
  }, {})
  cur = arrConcat.calc(op, cur, {
    items: [3, 4],
    active: true
  }, {})
  t.alike(cur.res, [3, 4])
})

test('objConcat: should initialize with empty object', (t) => {
  const op = {
    src: 'data'
  }
  const entry = {
    data: {
      a: 1,
      b: 2
    }
  }
  const result = objConcat.calc(op, null, entry, {})
  t.is(result.res.a, 1)
  t.is(result.res.b, 2)
})

test('objConcat: should concatenate object values', (t) => {
  const op = {
    src: 'data'
  }
  let cur = null
  cur = objConcat.calc(op, cur, {
    data: {
      a: 1,
      b: 2
    }
  }, {})
  cur = objConcat.calc(op, cur, {
    data: {
      a: 3,
      c: 4
    }
  }, {})
  t.is(cur.res.a, 4) // 1 + 3
  t.is(cur.res.b, 2)
  t.is(cur.res.c, 4)
})

test('objConcat: should handle null entry', (t) => {
  const op = {
    src: 'data'
  }
  const cur = { res: { a: 1 } }
  const result = objConcat.calc(op, cur, null, {})
  t.is(result.res.a, 1)
})

test('objConcat: should respect filter', (t) => {
  const op = {
    src: 'data',
    filter: (entry) => entry.active
  }
  let cur = null
  cur = objConcat.calc(op, cur, {
    data: { a: 1 },
    active: false
  }, {})
  cur = objConcat.calc(op, cur, {
    data: { a: 2 },
    active: true
  }, {})
  t.is(cur.res.a, 2)
})

test('nestedObjConcat: should initialize with empty object', (t) => {
  const op = {
    src: 'data',
    nestedOps: []
  }
  const entry = {
    data: {
      group1: { a: 1, b: 2 }
    }
  }
  const result = nestedObjConcat.calc(op, null, entry, {})
  t.is(result.res.group1.a, 1)
  t.is(result.res.group1.b, 2)
})

test('nestedObjConcat: should concatenate nested objects', (t) => {
  const op = {
    src: 'data',
    nestedOps: [
      { src: 'a', op: 'sum' },
      { src: 'b', op: 'sum' }
    ]
  }
  let cur = null
  cur = nestedObjConcat.calc(op, cur, {
    data: {
      group1: { a: 1, b: 2 }
    }
  }, {})
  cur = nestedObjConcat.calc(op, cur, {
    data: {
      group1: { a: 3, b: 4 }
    }
  }, {})
  t.is(cur.res.group1.a, 4) // 1 + 3
  t.is(cur.res.group1.b, 6) // 2 + 4
})

test('nestedObjConcat: should handle multiple groups', (t) => {
  const op = {
    src: 'data',
    nestedOps: [
      { src: 'value', op: 'sum' }
    ]
  }
  let cur = null
  cur = nestedObjConcat.calc(op, cur, {
    data: {
      group1: { value: 10 },
      group2: { value: 20 }
    }
  }, {})
  cur = nestedObjConcat.calc(op, cur, {
    data: {
      group1: { value: 5 }
    }
  }, {})
  t.is(cur.res.group1.value, 15)
  t.is(cur.res.group2.value, 20)
})

test('nestedObjConcat: should handle deeply nested objects', (t) => {
  const op = {
    src: 'data',
    nestedOps: [
      { src: 'value', op: 'sum' }
    ]
  }
  let cur = null
  cur = nestedObjConcat.calc(op, cur, {
    data: {
      level1: {
        level2: {
          value: 10
        }
      }
    }
  }, {})
  cur = nestedObjConcat.calc(op, cur, {
    data: {
      level1: {
        level2: {
          value: 5
        }
      }
    }
  }, {})
  t.is(cur.res.level1.level2.value, 15)
})

test('nestedObjConcat: should handle null entry', (t) => {
  const op = {
    src: 'data',
    nestedOps: []
  }
  const cur = { res: { group1: { a: 1 } } }
  const result = nestedObjConcat.calc(op, cur, null, {})
  t.is(result.res.group1.a, 1)
})

test('nestedObjConcat: should respect filter', (t) => {
  const op = {
    src: 'data',
    nestedOps: [
      { src: 'value', op: 'sum' }
    ],
    filter: (entry) => entry.active
  }
  let cur = null
  cur = nestedObjConcat.calc(op, cur, {
    data: { group1: { value: 10 } },
    active: false
  }, {})
  cur = nestedObjConcat.calc(op, cur, {
    data: { group1: { value: 5 } },
    active: true
  }, {})
  t.is(cur.res.group1.value, 5)
})
