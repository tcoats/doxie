async = require('odo-async')
const request = require('superagent')

module.exports = (hub) => {
  const lastscantime = {}
  hub.every('{ip} – seen doxie for the first time', (p, cb) => {
    lastscantime[p.ip] = 0
    cb()
  })
  hub.every('{ip} – bye bye doxie', (p, cb) => {
    delete lastscantime[p.ip]
    cb()
  })

  let handle = null
  const next = () => { handle = setTimeout(tick, 5000) }
  const tick = () => {
    console.log('scan tick', Object.keys(lastscantime).length)
    async.parallel(Object.keys(lastscantime).map((ip) => (cb) => {
      request
        .get(`http://${ip}/scans.json`)
        .set('Accept', 'application/json')
        .timeout({
          response: 1000,
          deadline: 4000,
        })
        .then((res) => {
          if (res.ok != null) {
            console.log(res.body)
          }
          cb()
        })
        .catch((err) => { cb() })
    }), () => {
      next()
    })
  }
  next()
}
