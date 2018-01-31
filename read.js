const async = require('odo-async')
const request = require('superagent')
const email = require('./email')

const standardtimeout = {
  response: 1 * 1000, // 1s
  deadline: 4 * 1000, // 4s
}

const getallscans = (ip, cb) => {
  request
    .get(`http://${ip}/scans.json`)
    .set('Accept', 'application/json')
    .timeout(standardtimeout)
    .then((res) => {
      if (res.ok != null) return cb(null, res.body)
      cb(res.text)
    })
    .catch((err) => { cb(err) })
}

const downloadscan = (ip, path, cb) => {
  request
    .get(`http://${ip}/scans${path}`)
    .timeout(standardtimeout)
    .then((res) => {
      if (res.ok != null) return cb(null, res.body)
      cb(res.text)
    })
    .catch((err) => { cb(err) })
}

const deletescans = (ip, files, cb) => {
  request
    .post(`http://${ip}/scans/delete.json`)
    .set('Content-Type', 'application/json')
    .send(Object.keys(files))
    .timeout(standardtimeout)
    .then((res) => {
      if (res.status == 204) return cb(null)
      cb(res.text)
    })
    .catch((err) => { cb(err) })
}

module.exports = (hub) => {
  const instances = {}
  hub.every('{ip} – scanning complete', (p, callback) => {
    callback()
    if (instances[p.ip]) return
    instances[p.ip] = true
    getallscans(p.ip, (err, results) => {
      if (err != null) console.error(err)
      if (err != null || results == null || results == '' || results.length == 0) {
        delete instances[p.ip]
        return
      }
      const files = {}
      console.log(`${ip} – downloading ${results.length} files`)
      async.parallel(results.map((scan) => (cb) => {
        downloadscan(p.ip, scan.name, (err, file) => {
          files[scan.name] = file
          cb()
        })
      }), () => {
        console.log(`${ip} – emailing ${results.length} files`)
        emailfiles(ip, files, (err) => {
          if (err != null) {
            console.error(err)
            delete instances[p.ip]
            return
          }
          console.log(`${ip} – deleting ${results.length} files`)
          deletefiles(ip, files, (err) => {
            if (err != null) {
              console.error(err)
              delete instances[p.ip]
              return
            }
            console.log(`${ip} – scans have been processed`)
            delete instances[p.ip]
          })
        })
      })
    })
  })
}
