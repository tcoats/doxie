module.exports = {
  waitformorescans: 60 * 60 * 1000, // 1m
  heartbeat: 15 * 1000, // 15s
  heartbeattimeout: {
    response: 5 * 1000, // 5s
    deadline: 10 * 1000 // 10s
  },
  changes: 10 * 1000, // 10s
  requesttimeout: {
    response: 1 * 1000, // 1s
    deadline: 4 * 1000, // 4s
  },
  nameprefix: 'Doxie ',
  from: 'sender@server.com',
  to: 'receiver@sender.com',
  subject: 'Message title',
  text: '',
  html: '',
  transport: {
    host: 'smtp.server.com',
    port: 465,
    secure: true,
    auth: {
      user: 'awesome',
      pass: 'awesome'
    }
  }
}
