const Logger = require('pino')
const LoggerSerializers = require('pino-std-serializers')

module.exports = {
  Service,
  Client
}

function Server (manifest, context) {
  const { ipcPath } = manifest
  const {
    logger = Logger()
  } = context

  var server = {
    methods: {},
    subscriptions: {}
  }

  manifestMethods = manifest.methods || []
  manifestMethods.forEach(method => {
    const { name, type, fn } = method
    server.methods[method.name] = ServerMethod({ ipcPath, logger, name, type, fn })
  })

  return server
}

function ServerMethod ({ ipcPath, logger, name, type, fn }) {
  const log = logger.child({ node: 'server', method: name })

  if (type === 'sync') {
    // coerce into async method
    type = 'async'
    var syncFn = fn
    fn = (...args) => {
      return cb => {
        try {
          cb(null, syncFn(...args))
        } catch (err) {
          cb(err)
        }
      }
    }
  }

  if (type === 'async') {
    // create socket
    var responder = zmq.socket('rep')
    responder.on('message', function (requestJson) {
      try {
        var request = JSON.parse(requestJson)
      } catch (err) {
        if (err) {
          log.error(err)
          sendError(responder, err)
          return
        }
      }

      log.info({ request })

      fn(request)((err, response) => {
        if (err) {
          log.error(err)
          sendError(responder, err)
          return
        }

        log.info({ response })

        var responseJson = JSON.stringify(response)
        responder.send(responseJson)
      })
    })
  } else if (type === 'source') {
  }

  if (responder) responder.bindSync(`${ipcPath}/${name}/rep`)
  if (pusher) pusher.bindSync(`${ipcPath}/${name}/push`)
  if (puller) puller.bindSync(`${ipcPath}/${name}/pull`)

  return fn
}

function Client (manifest) {
  const { ipcPath } = manifest

  var client = {
    methods: {},
    subscriptions: {}
  }

  manifestMethods = manifest.methods || []
  manifestMethods.forEach(manifestMethod => {
    const {
      name,
      type,
    } = manifestMethod

  })

  return client
}

function sendError (responder, err) {
  responder.send({
    error: LoggerSerializers.err(error)
  })
}
