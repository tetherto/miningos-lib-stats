'use strict'

const test = require('brittle')
const { applyStats, tallyStats, defaults } = require('../../index.js')

test('defaults should have timeframes', (t) => {
  t.ok(defaults.timeframes)
  t.ok(Array.isArray(defaults.timeframes))
  t.ok(defaults.timeframes.length > 0)
})

test('applyStats should apply operations to entries', (t) => {
  const state = {
    ops: {
      total: {
        op: 'sum',
        src: 'value'
      }
    }
  }

  const pack = {}
  const entry = { value: 10 }
  const ext = {}

  applyStats(state, pack, entry, ext)

  t.ok(pack.total)
  t.is(pack.total.res, 10)
})

test('applyStats should handle multiple operations', (t) => {
  const state = {
    ops: {
      total: {
        op: 'sum',
        src: 'value'
      },
      count: {
        op: 'cnt'
      }
    }
  }

  const pack = {}
  const entry = { value: 5 }
  const ext = {}

  applyStats(state, pack, entry, ext)

  t.is(pack.total.res, 5)
  t.is(pack.count.res, 1)
})

test('applyStats should skip operations without calc function', (t) => {
  const state = {
    ops: {
      total: {
        op: 'sum',
        src: 'value'
      }
    }
  }

  const pack = {}
  const entry = { value: 10 }
  const ext = {}

  applyStats(state, pack, entry, ext)

  t.is(pack.total.res, 10)
})

test('applyStats should handle null/undefined entries', (t) => {
  const state = {
    ops: {
      total: {
        op: 'sum',
        src: 'value'
      }
    }
  }

  const pack = {}
  applyStats(state, pack, null, {})
  applyStats(state, pack, undefined, {})

  t.ok(pack.total)
  t.is(pack.total.res, 0)
})

test('tallyStats should tally operations with tally function', (t) => {
  const state = {
    ops: {
      average: {
        op: 'avg',
        src: 'value'
      }
    }
  }

  const pack = {
    average: {
      acc: 30,
      cnt: 3,
      res: 0
    }
  }

  tallyStats(state, pack)

  t.is(pack.average, 10)
})

test('tallyStats should handle operations without tally function', (t) => {
  const state = {
    ops: {
      total: {
        op: 'sum',
        src: 'value'
      }
    }
  }

  const pack = {
    total: {
      res: 100
    }
  }

  tallyStats(state, pack)

  t.is(pack.total, 100)
})

test('tallyStats should skip missing pack values', (t) => {
  const state = {
    ops: {
      total: {
        op: 'sum',
        src: 'value'
      },
      missing: {
        op: 'sum',
        src: 'value'
      }
    }
  }

  const pack = {
    total: {
      res: 50
    }
  }

  tallyStats(state, pack)

  t.is(pack.total, 50)
  t.ok(!pack.missing)
})

test('applyStats and tallyStats integration', (t) => {
  const state = {
    ops: {
      average: {
        op: 'avg',
        src: 'value'
      },
      total: {
        op: 'sum',
        src: 'value'
      }
    }
  }

  const pack = {}
  const entries = [
    { value: 10 },
    { value: 20 },
    { value: 30 }
  ]

  entries.forEach(entry => {
    applyStats(state, pack, entry, {})
  })

  tallyStats(state, pack)

  t.is(pack.average, 20)
  t.is(pack.total, 60)
})
