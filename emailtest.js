const nodemailer = require('nodemailer')
const moment = require('moment')
const path = require('path')
const request = require('superagent')
const config = require('./config')

request
  .get('http://192.168.1.124/scans/DOXIE/JPEG/IMG_0001.JPG')
  .timeout(config.requesttimeout)
  .then((res) => {
    if (res.ok == null) return console.log(res.text)

    const message = {
      from: config.from,
      to: config.to,
      subject: config.subject || `${moment().format('YYYY-MM-DD')} – Doxie scanned 1 files`,
      text: config.text || '',
      html: config.html || '',
      attachments: [
        {
          filename: 'IMG_0001.JPG',
          content: res.body
        },
        {
          filename: 'IMG_0002.JPG',
          content: res.body
        }
      ]
    }

    const transport = nodemailer.createTransport(config.transport)
    transport.sendMail(message, (err, info) => {
      if (err) return console.log(err)
      console.log(info)
    })
  })
  .catch((err) => { console.log(err) })
