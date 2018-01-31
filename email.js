const nodemailer = require('nodemailer')
const moment = require('moment')
const path = require('path')

module.exports = (ip, files, cb) => {
  const message = {
    from: '"Mysterious Forces" <it@jswap.co.nz>',
    to: '"Thomas Coats" <thomas.coats@jswap.co.nz>',
    subject: `${moment().format('YYYY-MM-DD')} ${Object.keys(files).length} scanned files`,
    text: '',
    html: '',
    attachments: Object.keys(files).map((path) => {
      return {
        filename: path.parse(path).base,
        content: files[path]
      }
    })
  }

  const transport = nodemailer.createTransport({
    host: 'smtp.jswap.co.nz',
    port: 465,
    secure: true,
    auth: {
      user: 'awesome',
      pass: 'awesome'
    }
  })
  transport.sendMail(message, (err, info) => {
    if (err) return cb(err)
    cb()
  })
}
