const config = require('./config')
const hub = require('odo-hub')()

require('./read')(hub)
require('./changes')(hub)
require('./heartbeat')(hub)
let ssdp = null
if (config.ssdp)
  ssdp = require('./ssdp')(hub)


const shutdown = () => {
  if (ssdp != null)
    ssdp.close()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
