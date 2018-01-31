const async = require('odo-async')
const request = require('superagent')
const config = require('./config')

module.exports = (hub) => {
  const instances = {}
  hub.every('{ip} – doxie name does not start with "Doxie "', (p, cb) => {
    cb()
    if (instances[p.ip] != null) {
      hub.emit('{ip} – bye bye doxie', p)
      delete instances[p.ip]
    }
  })
  hub.every('{ip} – trouble talking to doxie – {message}', (p, cb) => {
    cb()
    if (instances[p.ip] != null) {
      hub.emit('{ip} – bye bye doxie', p)
      delete instances[p.ip]
    }
  })
  hub.every('{ip} – doxie available on ssdp', (p, cb) => {
    cb()
    if (instances[p.ip] == null) {
      hub.emit('{ip} – seen doxie for the first time', p)
      instances[p.ip] = true
    }
  })
  hub.every('{ip} – doxie unavailable on ssdp', (p, cb) => {
    cb()
    if (instances[p.ip] != null) {
      hub.emit('{ip} – bye bye doxie', p)
      delete instances[p.ip]
    }
  })

  let handle = null
  const next = () => { handle = setTimeout(tick, config.heartbeat) }
  const tick = () => {
    async.parallel(Object.keys(instances).map((ip) => (cb) => {
      request
        .get(`http://${ip}/hello.json`)
        .set('Accept', 'application/json')
        .timeout(config.heartbeattimeout)
        .then((res) => {
          if (res.ok == null) {
            hub.emit('{ip} – trouble talking to doxie – {message}', {
              ip: ip,
              message: res.text
            })
          }
          else if (res.body.name.indexOf(config.nameprefix) != 0) {
            hub.emit('{ip} – doxie name does not start with "{prefix}"', {
              ip: ip,
              prefix: config.nameprefix
            })
          }
          cb()
        })
        .catch((err) => {
          hub.emit('{ip} – trouble talking to doxie – {message}', {
            ip: ip,
            message: err.message
          })
          cb()
        })
    }), () => {
      next()
    })
  }
  next()
}
