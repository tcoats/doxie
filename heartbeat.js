const async = require('odo-async')
const request = require('superagent')

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
  const next = () => { handle = setTimeout(tick, 15000) } // 10s
  const tick = () => {
    async.parallel(Object.keys(instances).map((ip) => (cb) => {
      request
        .get(`http://${ip}/hello.json`)
        .set('Accept', 'application/json')
        .timeout({
          response: 5 * 1000, // 5s
          deadline: 10 * 1000 // 10s
        })
        .then((res) => {
          if (res.ok == null) {
            hub.emit('{ip} – trouble talking to doxie – {message}', {
              ip: ip,
              message: res.text
            })
          }
          else if (res.body.name.indexOf('Doxie ') != 0) {
            hub.emit('{ip} – doxie name does not start with "Doxie "', {
              ip: ip
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
