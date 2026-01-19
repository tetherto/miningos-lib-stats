'use strict'

const test = require('brittle')
const alertsAggr = require('../../ops/alerts_aggr.js')
const alertsGroupCnt = require('../../ops/alerts_group_cnt.js')

test('alertsAggr: should initialize with empty object', (t) => {
  const op = {
    src: 'groups'
  }
  const entry = {
    groups: {
      alert1: 5,
      alert2: 3
    }
  }
  const result = alertsAggr.calc(op, null, entry, {})
  t.is(result.res.alert1, 5)
  t.is(result.res.alert2, 3)
})

test('alertsAggr: should aggregate alert values', (t) => {
  const op = {
    src: 'groups'
  }
  let cur = null
  cur = alertsAggr.calc(op, cur, {
    groups: {
      alert1: 5,
      alert2: 3
    }
  }, {})
  cur = alertsAggr.calc(op, cur, {
    groups: {
      alert1: 2,
      alert2: 4,
      alert3: 1
    }
  }, {})
  t.is(cur.res.alert1, 7)
  t.is(cur.res.alert2, 7)
  t.is(cur.res.alert3, 1)
})

test('alertsAggr: should handle null entry', (t) => {
  const op = {
    src: 'groups'
  }
  const cur = { res: { alert1: 5 } }
  const result = alertsAggr.calc(op, cur, null, {})
  t.is(result.res.alert1, 5)
})

test('alertsAggr: should return early if no groups', (t) => {
  const op = {
    src: 'groups'
  }
  const cur = { res: { alert1: 5 } }
  const result = alertsAggr.calc(op, cur, { groups: null }, {})
  t.is(result.res.alert1, 5)
})

test('alertsAggr: should respect filter', (t) => {
  const op = {
    src: 'groups',
    filter: (entry) => entry.active
  }
  let cur = null
  cur = alertsAggr.calc(op, cur, {
    groups: { alert1: 5 },
    active: false
  }, {})
  cur = alertsAggr.calc(op, cur, {
    groups: { alert1: 3 },
    active: true
  }, {})
  t.is(cur.res.alert1, 3)
})

test('alertsGroupCnt: should initialize with empty object', (t) => {
  const op = {
    src: 'alerts'
  }
  const entry = {
    alerts: [
      { severity: 'high' },
      { severity: 'medium' }
    ]
  }
  const result = alertsGroupCnt.calc(op, null, entry, {})
  t.is(result.res.high, 1)
  t.is(result.res.medium, 1)
})

test('alertsGroupCnt: should count alerts by severity', (t) => {
  const op = {
    src: 'alerts'
  }
  let cur = null
  cur = alertsGroupCnt.calc(op, cur, {
    alerts: [
      { severity: 'high' },
      { severity: 'medium' }
    ]
  }, {})
  cur = alertsGroupCnt.calc(op, cur, {
    alerts: [
      { severity: 'high' },
      { severity: 'low' }
    ]
  }, {})
  t.is(cur.res.high, 2)
  t.is(cur.res.medium, 1)
  t.is(cur.res.low, 1)
})

test('alertsGroupCnt: should default to medium severity', (t) => {
  const op = {
    src: 'alerts'
  }
  const entry = {
    alerts: [
      { severity: 'high' },
      {} // missing severity
    ]
  }
  const result = alertsGroupCnt.calc(op, null, entry, {})
  t.is(result.res.high, 1)
  t.is(result.res.medium, 1)
})

test('alertsGroupCnt: should handle null entry', (t) => {
  const op = {
    src: 'alerts'
  }
  const cur = { res: { high: 1 } }
  const result = alertsGroupCnt.calc(op, cur, null, {})
  t.is(result.res.high, 1)
})

test('alertsGroupCnt: should return early if no alerts', (t) => {
  const op = {
    src: 'alerts'
  }
  const cur = { res: { high: 1 } }
  const result = alertsGroupCnt.calc(op, cur, { alerts: null }, {})
  t.is(result.res.high, 1)
})

test('alertsGroupCnt: should respect filter', (t) => {
  const op = {
    src: 'alerts',
    filter: (entry) => entry.active
  }
  let cur = null
  cur = alertsGroupCnt.calc(op, cur, {
    alerts: [{ severity: 'high' }],
    active: false
  }, {})
  cur = alertsGroupCnt.calc(op, cur, {
    alerts: [{ severity: 'medium' }],
    active: true
  }, {})
  t.is(cur.res.high, undefined)
  t.is(cur.res.medium, 1)
})
