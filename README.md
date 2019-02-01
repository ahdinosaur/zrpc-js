# zrpc

rpc services inspired by muxrpc and based on zmq

```shell
npm install --save zrpc
```

## concepts

- main service input: request / reply
  - use a router / dealer to handle requests async
- methods
  - if sync or async methods, rep returns value
  - if source, rep returns pull address
  - if sink, rep returns push address
- subscriptions
  - server can publish messages to all clients

- async
- source
- sink


- responders
- sources
- sinks
- 

### manifest

object representing a service manifest

- address: `String` service identifier
- type: enum of `sync`, `async`, `source`, `sink`, `duplex`

on a server manifest

- handler: a function to handle service call

## api

### `zrpc = require('zrpc')`

### `zrpc.Server(manifest)`

### `zrpc.Client(manifest)`

## usage


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
