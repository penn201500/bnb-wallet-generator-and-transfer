const bip39 = require('bip39');
const pkutils = require('ethereum-mnemonic-privatekey-utils');
const { Account } = require('eth-lib/lib');
const { writeDataToFile } = require('./utils');

const numberOfWallets = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 1;
if (isNaN(numberOfWallets) || numberOfWallets <= 0) {
    console.error('⛔️ Error: Please provide a valid number of wallets to generate!');
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

console.log(`✨ Generating ${numberOfWallets} wallet(s)...`);
let wallets = [];
let csvContent = "Mnemonic,PrivateKey,WalletAddress\n"; // Header for local display and CSV content

for (let i = 0; i < numberOfWallets; i++) {
    const { mnemonic, privateKey, walletAddress } = generateWallet();

    // Console output for each wallet
    console.log(`Wallet #${i + 1}`);
    console.log('📄 Mnemonic:', mnemonic);
    console.log('🔑 Private Key:', privateKey);
    console.log('👛 Wallet Address:', walletAddress);
    console.log('-----------------------------------');

    // Append to wallets array for file saving and CSV content for local output
    wallets.push({ mnemonic, privateKey, walletAddress });
    csvContent += `"${mnemonic}","${privateKey}","${walletAddress}"\n`;
}

// Save wallets to a file using the utility function
writeDataToFile(wallets, 'csv'); // Default is 'csv', change to 'json' to save as JSON
console.log(`✨ Generated and saved ${numberOfWallets} wallet(s) to file.`);
