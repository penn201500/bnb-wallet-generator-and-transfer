const bip39 = require('bip39');
const pkutils = require('ethereum-mnemonic-privatekey-utils');
const { Account } = require('eth-lib/lib');
const { writeDataToFile } = require('./utils');

// Parse command-line arguments
const numberOfWallets = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 1;
const format = process.argv.length > 3 ? process.argv[3] : 'csv';  // Default format is 'csv'

if (isNaN(numberOfWallets) || numberOfWallets <= 0) {
    console.error('⛔️ Error: Please provide a valid number of wallets to generate!');
    process.exit(1);
}

if (!['csv', 'json'].includes(format.toLowerCase())) {
    console.error('⛔️ Error: Format must be either "csv" or "json"!');
    process.exit(1);
}

function generateWallet() {
    const mnemonic = bip39.generateMnemonic();
    const privateKey = pkutils.getPrivateKeyFromMnemonic(mnemonic);
    const account = Account.fromPrivate('0x' + privateKey);
    return {
        mnemonic,
        privateKey,
        walletAddress: account.address.toLowerCase()
    };
}

console.log(`✨ Generating ${numberOfWallets} wallet(s) in ${format} format...`);
let wallets = [];
let csvContent = format === 'csv' ? "Mnemonic,PrivateKey,WalletAddress\n" : "";  // CSV Header

for (let i = 0; i < numberOfWallets; i++) {
    const wallet = generateWallet();

    // Console output for each wallet
    console.log(`Wallet #${i + 1}`);
    console.log('📄 Mnemonic:', wallet.mnemonic);
    console.log('🔑 Private Key:', wallet.privateKey);
    console.log('👛 Wallet Address:', wallet.walletAddress);
    console.log('-----------------------------------');

    wallets.push(wallet);
    if (format === 'csv') {
        csvContent += `"${wallet.mnemonic}","${wallet.privateKey}","${wallet.walletAddress}"\n`;
    }
}

// Save wallets to a file using the utility function
if (format === 'csv') {
    writeDataToFile(csvContent, 'csv');  // Ensure proper filename for CSV
} else {
    writeDataToFile(wallets, 'json');  // Ensure proper filename for JSON
}

console.log(`✨ Generated and saved ${numberOfWallets} wallet(s) in ${format} format.`);
