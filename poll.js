const async = require('odo-async')
const request = require('superagent')
const sendingdelay = 60 * 60 * 1000 // 1m

const getrecentscan = (ip, cb) => {
  request
    .get(`http://${ip}/scans/recent.json`)
    .set('Accept', 'application/json')
    .timeout({
      response: 1 * 1000, // 1s
      deadline: 4 * 1000, // 4s
    })
    .then((res) => {
      if (res.status == 204) return cb(null, null)
      if (res.ok != null) return cb(null, res.body.path)
      cb(res.text)
    })
    .catch((err) => { cb(err) })
}

module.exports = (hub) => {
  const instances = {}
  hub.every('{ip} – seen doxie for the first time', (p, cb) => {
    if (instances[p.ip] == null)
      instances[p.ip] = {
        ip: p.ip,
        active: true,
        changedat: 0,
        recentscan: null
      }
    else
      instances[p.ip].active = true
    cb()
  })
  hub.every('{ip} – bye bye doxie', (p, cb) => {
    if (instances[p.ip] != null) instances[p.ip].active = false
    cb()
  })

  let handle = null
  const next = () => { handle = setTimeout(tick, 10 * 1000) } // 10s
  const tick = () => {
    const now = new Date().getTime()
    if (Object.keys(instances).length == 0)
      console.log("It's lonely without doxie")
    async.parallel(Object.keys(instances)
      .filter((ip) => instances[ip].active)
      .map((ip) => (cb) => {
        getrecentscan(ip, (err, result) => {
          if (err != null) console.error(err)
          if (err != null || instances[ip] == null) return cb()
          if (result == null) {
            console.log(`${ip} – no recent scans`)
            instances[ip] = { changedat: now, recentscan: null }
            return cb()
          }
          const i = instances[ip]
          if (i.recentscan != result) {
            console.log(`${ip} – new scan`)
            instances[ip] = { changedat: now, recentscan: result }
          }
          else if (i.changedat < now - sendingdelay) {
            hub.emit('{ip} - scanning complete', instances[ip])
            instances[ip] = { changedat: now, recentscan: null }
            return cb()
          }
          console.log(`${ip} – waiting for more scans`)
          cb()
        })
      }), () => {
        next()
      })
  }
  next()
}
