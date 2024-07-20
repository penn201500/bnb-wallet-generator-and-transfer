const fs = require("fs")
const { parse } = require("csv-parse/sync")
const { Web3 } = require("web3")
const BN = require("bn.js")
// const bscURL = "https://bsc-dataseed.binance.org/"
const bscTestnetURL = "https://data-seed-prebsc-1-s1.binance.org:8545/"
const web3 = new Web3(bscTestnetURL)

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

// Function to read data from a file and return an array of wallet addresses
// File format should be either CSV or JSON
function readWalletsWithPrivateKeys(filePath) {
  const data = fs.readFileSync(filePath, "utf8")
  if (filePath.endsWith(".csv")) {
    return parse(data, { columns: true }).map(row => ({ address: row.WalletAddress, privateKey: row.PrivateKey }))
  } else if (filePath.endsWith(".json")) {
    return JSON.parse(data).map(wallet => ({ address: wallet.walletAddress, privateKey: wallet.privateKey }))
  } else {
    throw new Error("Unsupported file format")
  }
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
  const totalAmountBN = new BN(totalAmount)
  const senderBalanceBN = new BN(senderBalance)
  if (senderBalanceBN.lt(totalAmountBN)) {
    throw new Error(`Insufficient balance. Required: ${totalAmount}, Available: ${senderBalance}`)
  }
  return { totalAmount, senderBalance }
}

async function performTransfer(sender, privateKey, receiver, amount, nonce) {
  let tx
  const chainId = await web3.eth.getChainId()
  try {
    // Check if the network uses EIP-1559 transaction type
    // 1: Ethereum Mainnet
    // 3: Ropsten (Ethereum testnet)
    // 4: Rinkeby (Ethereum testnet)
    // 5: Goerli (Ethereum testnet)
    // 42: Kovan (Ethereum testnet)
    // 56: Binance Smart Chain Mainnet
    // 97: Binance Smart Chain Testnet
    if ([1, 3, 4, 5, 42, 56, 97].includes(chainId)) {
      // Including Chain ID 97 for BSC Testnet which does not use EIP-1559, so this should be adjusted if needed
      const [maxPriorityFeePerGas, maxFeePerGas] = await Promise.all([web3.eth.getMaxPriorityFeePerGas(), web3.eth.getGasPrice()])
      tx = {
        from: sender,
        to: receiver,
        value: web3.utils.toWei(amount.toString(), "ether"),
        maxPriorityFeePerGas,
        maxFeePerGas,
        nonce: BigInt(nonce),
        chainId,
      }
    } else {
      tx = {
        from: sender,
        to: receiver,
        value: web3.utils.toWei(amount.toString(), "ether"),
        gasPrice: await web3.eth.getGasPrice(),
        nonce: BigInt(nonce),
        chainId,
      }
    }

    // Dynamically estimate gas and ensure it's not below the minimum needed for a simple transfer
    // Correct handling for BigInt comparison and assignment
    const estimatedGas = BigInt(await web3.eth.estimateGas(tx))
    tx.gas = estimatedGas > BigInt(21000) ? estimatedGas : BigInt(21000)

    // Sign and send the transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  } catch (error) {
    console.error("Transaction failed:", error)
    // Handle specific error scenarios here
    if (error.message.includes("timeout")) {
      console.error("EVM timeout occurred - the transaction may still be pending and consume gas!")
    }
    // Re-throw the error if you need to escalate it
    throw error
  }
}

// Calculate the fee for a transaction
async function calculateFee(transaction) {
  const gasPrice = await web3.eth.getGasPrice() // Current gas price in wei
  const estimatedGas = await web3.eth.estimateGas(transaction) // Estimate gas based on transaction
  return new BN(gasPrice).mul(new BN(estimatedGas)) // Total fee in wei
}

module.exports = {
  getFormattedDateTime,
  writeDataToFile,
  readWalletAddresses,
  checkBalanceAndCalculate,
  performTransfer,
  calculateFee,
  readWalletsWithPrivateKeys,
  web3,
  BN,
}
