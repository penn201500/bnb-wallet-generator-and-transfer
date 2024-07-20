const fs = require("fs")
const parse = require("csv-parse/sync")
const { Web3 } = require('web3');
// const bscURL = "https://bsc-dataseed.binance.org/"
const bscTestnetURL = "https://data-seed-prebsc-1-s1.binance.org:8545/"
const web3 = new Web3(bscTestnetURL);

// Function to format the current date and time as "YYYY-MM-DD_HH-MM-SS"
function getFormattedDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // Months are zero-indexed in JavaScript
  const day = now.getDate()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}_${hours.toString().padStart(2, "0")}-${minutes.toString().padStart(2, "0")}-${seconds.toString().padStart(2, "0")}`
}

// Function to write data to a file in CSV or JSON format
function writeDataToFile(prefix, data, format = "csv") {
  const filename = `${prefix}_${getFormattedDateTime()}.${format}`
  let content
  if (format === "csv") {
    content = data
  } else {
    // JSON format
    content = JSON.stringify(data, null, 2)
  }
  fs.writeFileSync(filename, content, "utf8")
  console.log(`Data saved to '${filename}'`)
}

function readWalletAddresses(filePath) {
  const data = fs.readFileSync(filePath, "utf8")
  if (filePath.endsWith(".csv")) {
    return parse(data, { columns: true }).map(row => row.WalletAddress)
  } else if (filePath.endsWith(".json")) {
    return JSON.parse(data).map(wallet => wallet.walletAddress)
  } else {
    throw new Error("Unsupported file format")
  }
}

async function checkBalanceAndCalculate(sender, amount, numWallets) {
  let gas_fee_percentage = 0.01 // 1% is an estimation, update it as needed
  const totalAmount = web3.utils.toWei((amount * numWallets * (1 + gas_fee_percentage)).toString(), "ether")
  const senderBalance = await web3.eth.getBalance(sender)
  if (new web3.utils.BN(senderBalance).lt(new web3.utils.BN(totalAmount))) {
    throw new Error(`Insufficient balance. Required: ${totalAmount}, Available: ${senderBalance}`)
  }
  return { totalAmount, senderBalance }
}

async function performTransfer(sender, privateKey, receiver, amount) {
  const tx = {
    from: sender,
    to: receiver,
    value: web3.utils.toWei(amount.toString(), "ether"),
    gas: 200000,
  }
  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)
  return await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
}

module.exports = {
  getFormattedDateTime,
  writeDataToFile,
  readWalletAddresses,
  checkBalanceAndCalculate,
  performTransfer,
}
