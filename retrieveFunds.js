const { web3, BN, readWalletsWithPrivateKeys, calculateFee, performTransfer, writeDataToFile, getFormattedDateTime } = require("./utils")

async function retrieveFunds(walletFilePath, centralWalletAddress) {
  const results = []
  const wallets = await readWalletsWithPrivateKeys(walletFilePath)
  for (const wallet of wallets) {
    const balance = await web3.eth.getBalance(wallet.address)
    if (new BN(balance).isZero()) {
      console.log(`No funds to retrieve from ${wallet.address}`)
      throw new Error(`No funds to retrieve from ${wallet.address}`)
    }
    console.log(`Balance of ${wallet.address} is ${web3.utils.fromWei(balance, "ether")} BNB`)

    let transaction = {
      from: wallet.address,
      to: centralWalletAddress,
      value: balance,
    }

    const estimatedGas = BigInt(await web3.eth.estimateGas({ ...transaction, value: "0x0" }))
    const gasPrice = BigInt(await web3.eth.getGasPrice())
    transaction.gas = estimatedGas > BigInt(21000) ? estimatedGas : BigInt(21000)

    const fee = new BN(gasPrice).mul(new BN(transaction.gas))
    transaction.value = new BN(transaction.value).sub(fee).toString()

    if (new BN(transaction.value).lte(new BN(0))) {
      console.log(`Insufficient funds to cover the fee from ${wallet.address}`)
      throw new Error(`Insufficient funds to cover the fee from ${wallet.address}`)
    }

    const amountTransferred = web3.utils.fromWei(transaction.value, "ether")
    const gasFee = web3.utils.fromWei(fee.toString(), "ether")
    let nonce = await web3.eth.getTransactionCount(wallet.address, "pending") // Get the current nonce
    // nonce++
    const receipt = await performTransfer(wallet.address, wallet.privateKey, centralWalletAddress, amountTransferred, nonce)
    if (!receipt.status) {
      throw new Error(`Transaction failed at ${wallet.address}, transaction hash: ${receipt.transactionHash}`)
    }

    results.push({
      from: wallet.address,
      to: centralWalletAddress,
      transactionHash: receipt.transactionHash,
      status: "Success",
      amountTransferred: amountTransferred,
      gasFee: gasFee,
    })
    console.log(`Transferred ${amountTransferred} BNB from ${wallet.address} to ${centralWalletAddress}, TxHash: ${receipt.transactionHash}, gasFee: ${gasFee}`)
  }
  return results
}

async function main() {
  const [walletFilePath, centralWalletAddress] = process.argv.slice(2)
  if (!walletFilePath || !centralWalletAddress) {
    console.error("Please specify the wallet file path and the central wallet address.")
    process.exit(1)
  }

  try {
    const results = await retrieveFunds(walletFilePath, centralWalletAddress)
    let format = "csv"
    if (format === "csv") {
      let content = "From,To,TransactionHash,Status,AmountTransferred,GasFee\n"
      results.forEach(result => {
        content += `"${result.from}","${result.to}","${result.transactionHash}","${result.status}","${result.amountTransferred}","${result.gasFee}"\n`
      })
      writeDataToFile("retrieveFunds-transactions", content, "csv") // Ensure proper filename for CSV
    } else {
      writeDataToFile("retrieveFunds-transactions", results, "json") // Ensure proper filename for JSON
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error.message)
    process.exit(1)
  }
}

main().catch(error => {
  console.error("An unexpected error occurred:", error.message)
  process.exit(1)
})
