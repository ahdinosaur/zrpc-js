const Logger = require('pino')
const LoggerSerializers = require('pino-std-serializers')
const zmq = require('zeromq-ng')

module.exports = {
  Server,
  Client
}

function Server (manifest, context = {}) {
  const { address, type, handle } = manifest
  const { logger = Logger() } = context
  
  const log = logger.child({ node: 'server', address })

  const socket = new zmq.Router({
    routingId: address
  })

  return {
    address,
    type,
    handle,
    start,
    stop
  }

  async function start () {
    await socket.bind(address)
    log.info('bound')

    loop()
  }

  async function loop () {
    while (!socket.closed) {
      const [clientAddress, _1, controlBuffer, _2, requestBuffer] = await socket.receive()
      const control = controlBuffer.toString()
      const requestString = requestBuffer.toString()
      log.info({ msg: `received message from client`, clientAddress, control, requestString })

      var message = [clientAddress, null, control, null]

      if (control === 'PING') {
        message[2] = 'PONG'
        await send({ log, message, socket })
        break
      }

      try {
        var request = JSON.parse(requestString)
      } catch (error) {
        if (error) {
          await sendError({ error, log, message, socket })
          break
        }
      }

      log.info({ request })

      if (type === 'sync' || type === 'async') {
        try {
          var response = await handle(request)
        } catch (error) {
          await sendError({ error, log, message, socket })
          break
        }

        await sendResponse({ log, message, response, socket })
      }
    }
  }

  async function stop () {
    if (!socket.closed) {
      await socket.close()
    }
  }
}

function Client (manifest, context = {}) {
  const { address, type } = manifest
  const { logger = Logger() } = context
  
  const log = logger.child({ node: 'client', address })

  const socket = new zmq.Router({})

  return {
    address,
    type,
    handle,
    start,
    stop
  }

  async function handle (request) {
    const control = 'TODO'
    const requestString = JSON.stringify(request)
    const message = [address, null, control, null, requestString]
    send({ log, message, socket })
    const [serverAddress, _1, responseControlBuffer, _2, responseTypeBuffer, responseBuffer] = await socket.receive()
    const responseControl = responseControlBuffer.toString()
    const responseType = responseTypeBuffer.toString()
    const responseString = responseBuffer.toString()
    log.info({ msg: `received message from server`, serverAddress, responseControl, responseType, responseString })
    const response = JSON.parse(responseString)
    if (responseType === 'ERROR') {
      return Promise.reject(response)
    }
    return response
  }

  async function start () {
    await socket.connect(address)
    log.info('connected')
  }

  async function stop () {
    if (!socket.closed) {
      await socket.close()
    }
  }
}

async function sendError ({ error, log, message, socket }) {
  log.error(error)

  message[4] = 'ERROR'
  message[5] = LoggerSerializers.err(error)

  await send({ log, message, socket })
}

async function sendResponse ({ log, message, response, socket }) {
  log.info({ response })

  message[4] = 'RESPONSE'
  message[5] = JSON.stringify(response)

  await send({ log, message, socket })
}

async function send ({ log, message, socket }) {
  log.info({ msg: `sending message`, message })
  try {
    await socket.send(message)
  } catch (error) {
    log.error({ msg: `unable to send message`, message })
  }
}
