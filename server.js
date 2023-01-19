const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser')
const path = require('path')
const client = require('socket.io-client')
const Block = require('./block')
const blockChain = []
const diffAdjustInterval = 5
const blockGenerationInterval = 2

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'src/style')))
app.use(express.static(path.join(__dirname, 'src/server')))

if (process.argv.length < 3) {
  console.error('Missing port')
  process.exit(1)
}
if (process.argv.length > 3) {
  console.error('Too many arguments')
  process.exit(1)
}
if (parseInt(process.argv[2]) < 2000 ||
  parseInt(process.argv[2]) > 3000) {
  console.error('Wrong port format')
  process.exit(1)
}
const PORT = process.argv[2]
if (PORT === undefined) {
  process.exit(1)
}

server.listen(PORT, () => {
  console.log(`listening on: ${server.address().address}:${PORT}`)
})

io.on('connection', socket => {
  let sock
  socket.on('register', async (name, port, fn) => {
    console.log(name)
    console.log(port)
    if (port !== undefined && port > 1000 && port < 10000 && port !== PORT) {
      sock = await client.connect('http://127.0.0.1:' + port)
      sock.on('disconnect', () => {
        console.log('disconnected');
      })
      fn('All good')
    } else {
      console.log('ERROR')
      fn('Missing data')
    }
  })
  socket.on('blocks', (block, fn) => {
    console.log(block)
    blockChain.push(block)
    fn()
  })
  socket.on('disconnect', () => {
    console.log("Disconnected")
  })
})
