const Block = require("./block");
const {parentPort, workerData} = require("worker_threads");

const blockChain = []
const diffAdjustInterval = 5
const blockGenerationInterval = 2
let index = 0
let diff = 4
let prevHash = 0

startMining()

function startMining () {
    let nonce = 0
    for (let i = 0; index < workerData.data.length; i++) {
        console.log("Data:")
        console.log(workerData.data[0])
        const block = new Block(index, workerData.data[0]["payload"], new Date().getTime(), diff, prevHash, nonce)
        if (block.hash.substr(0, diff) === '0'.repeat(diff)) {
            validateBlockchain()
            blockChain.push(block)
            parentPort.postMessage(block);
            index++
            prevHash = block.hash
            diff = adjustDifficulty(block)
            nonce = 0
        } else {
            nonce++
        }
    }
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
