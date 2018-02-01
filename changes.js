const async = require('odo-async')
const http = require('http')
const config = require('./config')

const getrecentscan = (ip, cb) => {
  const req = http.get(`http://${ip}/scans/recent.json`, (res) => {
    res.setEncoding('utf8')
    let content = ''
    res.on('data', data => {
      content += data
    });
    res.on('end', () => {
      try {
        content = JSON.parse(content)
        cb(null, content.path)
      }
      catch (err) {
        cb()
      }
    })
    res.on('error', (err) => {
      console.log('request error')
      cb(err)
    })
  })
  req.on('socket', (socket) => {
    socket.on('error', (err) => {
      console.log('socket error')
      req.abort()
      cb(err)
    })
  })
  req.on('error', (err) => {
    cb(err)
  })
  req.end()
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
  const next = () => { handle = setTimeout(tick, config.changes) }
  const tick = () => {
    const now = new Date().getTime()
    const count = Object.keys(instances)
      .filter((ip) => instances[ip].active).length
    // if (count == 0)
    //   console.log("It's lonely without doxie")
    async.parallel(Object.keys(instances)
      .filter((ip) => instances[ip].active)
      .map((ip) => (cb) => {
        getrecentscan(ip, (err, result) => {
          if (err != null || instances[ip] == null) return cb()
          if (result == null) {
            //console.log(`${ip} – no recent scans`)
            instances[ip].changedat = now
            instances[ip].recentscan = null
            return cb()
          }
          const i = instances[ip]
          if (i.recentscan != result) {
            console.log(`${ip} – new scan – ${result}`)
            instances[ip].changedat = now
            instances[ip].recentscan = result
            return cb()
          }
          else if (i.changedat < now - config.waitformorescans) {
            hub.emit('{ip} – scanning complete', instances[ip])
            instances[ip].changedat = now
            return cb()
          }
          console.log(`${ip} – waiting ${((i.changedat + config.waitformorescans - now) / 1000).toFixed(0)}s for more scans`)
          cb()
        })
      }), () => {
        next()
      })
  }
  next()
}
