const nodemailer = require('nodemailer')
const moment = require('moment')
const path = require('path')
const config = require('./config')

module.exports = (ip, files, cb) => {
  files = Object.keys(files).map((filepath) => {
    return {
      filename: path.basename(filepath),
      content: files[filepath]
    }
  })
  const message = {
    from: config.from,
    to: config.to,
    subject: config.subject || `${moment().format('YYYY-MM-DD hh:mma')} – Doxie scanned ${files.length} files`,
    text: config.text || '',
    html: config.html || '',
    attachments: files
  }

  const transport = nodemailer.createTransport(config.transport)
  transport.sendMail(message, (err, info) => {
    if (err) return cb(err)
    cb()
  })
}
