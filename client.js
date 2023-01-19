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

server.listen(PORT, () => {
  console.log(`listening on: ${server.address().address}:${PORT}`)
})

io.on('connection', socket => {
  let sock
  socket.on('join', async (name, port, fn) => {
    console.log(name)
    console.log(port)
    if (port !== undefined && port > 1000 && port < 10000 && port !== PORT) {
      sock = await client.connect('http://127.0.0.1:' + port)
      sock.emit("register", name, PORT, (res) => {
        if (res == 'All good'){
          console.log('Registration successful')
        } else {
          console.log('Registration failed:', res);
        }
      })
      sock.on('connect', () => {
        console.log(`Connected at ${port}`)
        fn('Connected')
      })
      /*sock.on('blocks', (block) => {
        console.log(block)
        blockChain.push(block)
      })*/
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
    //startMining(sock)
    sock.emit('blocks', "aaa", (res) => {
      console.log(res)
      if (res == "Next block"){
        console.log(res)
      }
    })
    sock.emit('blocks', "bbbb", (res) => {
      console.log(res)
      if (res == "Next block"){
        console.log(res)
      }
    })
  })
})


let index = 0
let diff = 4
let prevHash = 0
async function startMining () {
  let nonce = 0
  while (true) {
    // for (let i = 0; i < 1000000; i++) {
    // console.log('WE DO BE MINING')
    const block = new Block(index, 'krompir', new Date().getTime(), diff, prevHash, nonce)
    if (block.hash.substr(0, diff) === '0'.repeat(diff)) {
      validateBlockchain()
      blockChain.push(block)
      console.log(block)
      index++
      prevHash = block.hash
      diff = adjustDifficulty(block)
      nonce = 0
    } else {
      nonce++
    }
    //await new Promise(r => setTimeout(r, 1))
  }
  console.log('DONE')
  // console.log(blockChain)
}

function validateBlockchain () {
  const currTS = new Date().getTime()
  for (let i = 1; i < blockChain.length; i++) {
    const currBlock = blockChain[i]
    if (currBlock.validity) { continue }
    const prevBlock = blockChain[i - 1]
    if (prevBlock.prevHash === 0 && (currTS - prevBlock.timestamp) <= 60000 && (currTS - currBlock.timestamp) >= 60000) {
      prevBlock.validity = true
    }
    if (currBlock.prevHash === prevBlock.hash && (currTS - prevBlock.timestamp) <= 60000 && (currTS - currBlock.timestamp) >= 60000) {
      currBlock.validity = true
    }
  }
}

function adjustDifficulty (block) {
  if (blockChain.length < diffAdjustInterval) return diffAdjustInterval;
  const adBlock = blockChain[blockChain.length - diffAdjustInterval]
  const timeExpected = blockGenerationInterval * diffAdjustInterval * 1000
  const timeTaken = block.timestamp - adBlock.timestamp

  if (timeTaken < (timeExpected / 2)) {
    return block.diff + 1
  } else if (timeTaken > (timeExpected * 2)) {
    return block.diff - 1
  } else {
    return block.diff
  }
}
