const url = require('url')
const urn = 'urn:schemas-getdoxie-com:device:Scanner:1'

module.exports = (hub) => {
  const ssdp = require('node-upnp-ssdp')

  ssdp.on(`DeviceAvailable:${urn}`, (ref) => {
    hub.emit('{ip} – doxie available on ssdp', { ip: url.parse(ref.location).hostname })
  })
  ssdp.on(`DeviceUnavailable:${urn}`, (ref) => {
    hub.emit('{ip} – doxie unavailable on ssdp', { ip: url.parse(ref.location).hostname })
  })
  ssdp.mSearch(urn)

  return ssdp
}
