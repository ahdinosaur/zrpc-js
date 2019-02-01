const test = require('ava')

const zrpc = require('../')

test('zrpc', function (t) {
  t.truthy(zrpc, 'module is require-able')
})
