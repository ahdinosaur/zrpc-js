const { join } = require('path')
const pull = require('pull-stream')
const zrpc = require('./')

const manifest = {
  address: `ipc://${join(__dirname, 'ipc')}`,

  methods: [
    {
      name: 'hello',
      type: 'async',
      fn: function ({ name }) {
        return cb => cb('hello, ' + name + '!')
      }
    },
    {
      name: 'stuff',
      type: 'source',
      fn: function () {
        return pull.values([1, 2, 3, 4, 5])
      }
    }
  ]
}

const client = zrpc.Client(manifest)

zrpc.Server(manifest, function (err, server) {
  if (err) throw err

  client.methods.hello('world')((err, value) => {
    if (err) throw err

    console.log(value)
    // hello, world!
  })

  pull(
    client.methods.stuff(),
    pull.drain(console.log)
  )
  // 1
  // 2
  // 3
  // 4
  // 5
})


