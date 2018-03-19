const hub = require('odo-hub')()

require('./read')(hub)
require('./changes')(hub)
require('./heartbeat')(hub)
//const ssdp = require('./ssdp')(hub)


const shutdown = () => {
  //ssdp.close()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
