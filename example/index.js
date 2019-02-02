const { join } = require('path')
const zrpc = require('../')

const helloSync = {
  address: `ipc://${join(__dirname, 'example.socket')}`,
  type: 'sync',
  handle: function ({ name }) {
    return 'hello, ' + name + '!'
  }
}

run()

async function run () {
  const server = zrpc.Server(helloSync)
  await server.start()

  const client = zrpc.Client(helloSync)
  await client.start()

  const response = await client.handle({ name: 'dinosaur' })
  console.log(response)
}
