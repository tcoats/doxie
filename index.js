const url = require('url')
const ssdp = require('node-upnp-ssdp')
const urn = 'urn:schemas-getdoxie-com:device:Scanner:1'

const instances = {}

ssdp.on(`DeviceAvailable:${urn}`, (ref) => {
  const location = url.parse(ref.location)
  console.log(location.hostname)
})
ssdp.on(`DeviceUnavailable:${urn}`, (ref) => {
  const location = url.parse(ref.location)
  console.log(location.hostname)
})

ssdp.mSearch(urn)


const shutdown = () => {
  ssdp.close()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
