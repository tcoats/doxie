const nodemailer = require('nodemailer')
const moment = require('moment')
const path = require('path')
const config = require('./config.test')

module.exports = (ip, files, cb) => {
  const message = {
    from: config.from,
    to: config.to,
    subject: config.subject || `${moment().format('YYYY-MM-DD')} – Doxie scanned ${Object.keys(files).length} files`,
    text: config.text || '',
    html: config.html || '',
    attachments: Object.keys(files).map((path) => {
      return {
        filename: path.parse(path).base,
        content: files[path]
      }
    })
  }

  const transport = nodemailer.createTransport(config.transport)
  transport.sendMail(message, (err, info) => {
    if (err) return cb(err)
    cb()
  })
}
