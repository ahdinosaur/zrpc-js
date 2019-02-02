# zrpc-js

rpc micro-services inspired by [muxrpc](https://github.com/ssbc/muxrpc) and "serverless" functions, based on [zmq](http://zeromq.org)

_work in progress_

```shell
npm install --save zrpc
```

## concepts

based on [zmq freelance pattern](http://zguide.zeromq.org/page:all#Brokerless-Reliability-Freelance-Pattern).

a manifest is for a single "serverless" function service.

the manifest allows the client to connect to the server.

the client uses the address of the server to identify it.

the server gives the client an identity.

the server responds using the service handler.

for source, sink, duplex responses, the service handler will respond with new address(es) to connect.

TODO status subscriptions: server can publish messages to all clients

### manifest

object representing a service manifest

- address: `String` service identifier (starting with `tcp://`, `ipc://`, etc)
- type: enum of `sync`, `async`, `source`, `sink`, `duplex`

on a server manifest

- handler: a function to handle service call

## example

```js
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
```

## api

### `zrpc = require('zrpc')`

### `server = zrpc.Server(manifest)`

### `client = zrpc.Client(manifest)`

## license

The Apache License

Copyright &copy; 2019 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
