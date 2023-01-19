const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser')
const path = require('path')
const client = require('socket.io-client')
const Block = require('./block')
const {Worker} = require("worker_threads");
const blockChain = []

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'src/style')))
app.use(express.static(path.join(__dirname, 'src/client')))

if (process.argv.length < 3) {
  console.error('Missing port')
  process.exit(1)
}
if (process.argv.length > 3) {
  console.error('Too many arguments')
  process.exit(1)
}
if (parseInt(process.argv[2]) <= 1000 ||
  parseInt(process.argv[2]) > 9999) {
  console.error('Wrong port format')
  process.exit(1)
}
const PORT = process.argv[2]
if (PORT === undefined) {
  process.exit(1)
}

console.log("Executed in the parent thread");

server.listen(PORT, () => {
  console.log(`listening on: ${server.address().address}:${PORT}`)
})

io.on('connection', socket => {
  let sock = null;
  socket.on('join', async (name, port, fn) => {
    console.log(name)
    console.log(port)
    if (port !== undefined && port > 1000 && port < 10000 && port !== PORT) {
      sock = await client.connect('http://127.0.0.1:' + port)
      sock.emit("register", name, PORT)
      sock.on('connect', async () => {
        console.log(`Connected at ${port}`)
        fn('Connected')
      })
      sock.on('disconnect', () => {
        console.log(`Disconnected from ${port}`)
        fn('Disconnected')
      })
    } else {
      console.log('ERROR')
      fn('Missing data')
    }
  })
  socket.on('mine', () => {
    const worker = new Worker("./miner.js");

    worker.on("message", block => {
      console.log(block);
      sock.emit('blocks', block, (res) => {
        console.log(res);
      })
    });

    worker.on("error", error => {
      console.log(error);
    });

    worker.on("exit", exitCode => {
      console.log(exitCode);
    })

  })
})


