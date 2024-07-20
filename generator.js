const { ethers } = require("ethers")
const { writeDataToFile } = require("./utils")
const { stringify } = require("csv-stringify/sync")

// Parse command-line arguments
const numberOfWallets = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 1
const format = process.argv.length > 3 ? process.argv[3] : "csv" // Default format is 'csv'

if (isNaN(numberOfWallets) || numberOfWallets <= 0) {
  console.error("⛔️ Error: Please provide a valid number of wallets to generate!")
  process.exit(1)
}

if (!["csv", "json"].includes(format.toLowerCase())) {
  console.error('⛔️ Error: Format must be either "csv" or "json"!')
  process.exit(1)
}

function generateWallet() {
  const wallet = ethers.Wallet.createRandom()
  return {
    mnemonic: wallet.mnemonic.phrase,
    privateKey: wallet.privateKey,
    walletAddress: wallet.address,
  }
}

console.log(`✨ Generating ${numberOfWallets} wallet(s) in ${format} format...`)
let wallets = []
let rows = []

for (let i = 0; i < numberOfWallets; i++) {
  const wallet = generateWallet()

  // Console output for each wallet
  console.log(`Wallet #${i + 1}`)
  console.log("📄 Mnemonic:", wallet.mnemonic)
  console.log("🔑 Private Key:", wallet.privateKey)
  console.log("👛 Wallet Address:", wallet.walletAddress)
  console.log("-----------------------------------")

  wallets.push(wallet)
  rows.push([wallet.mnemonic, wallet.privateKey, wallet.walletAddress])
}

let csvContent
// Save wallets to a file using the utility function
if (format === "csv") {
  csvContent = stringify(rows, { header: true, columns: ["Mnemonic", "PrivateKey", "WalletAddress"] })
  writeDataToFile("wallets", csvContent, "csv") // Ensure proper filename for CSV
} else {
  writeDataToFile("wallets", wallets, "json") // Ensure proper filename for JSON
}

console.log(`✨ Generated and saved ${numberOfWallets} wallet(s) in ${format} format.`)
