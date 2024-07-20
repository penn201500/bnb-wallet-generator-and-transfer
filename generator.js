const bip39 = require('bip39');
const pkutils = require('ethereum-mnemonic-privatekey-utils');
const { Account } = require('eth-lib/lib');
const fs = require('fs');

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

let csvContent = "Mnemonic,PrivateKey,WalletAddress\n"; // Header
console.log(`✨ Generating ${numberOfWallets} wallet(s)...`);

for (let i = 0; i < numberOfWallets; i++) {
    const { mnemonic, privateKey, walletAddress } = generateWallet();

    // Console output for each wallet
    console.log(`Wallet #${i + 1}`);
    console.log('📄 Mnemonic:', mnemonic);
    console.log('🔑 Private Key:', privateKey);
    console.log('👛 Wallet Address:', walletAddress);
    console.log('-----------------------------------');

    // Append to CSV content
    csvContent += `"${mnemonic}","${privateKey}","${walletAddress}"\n`;
}

// Save to CSV file
fs.writeFileSync('wallets.csv', csvContent, 'utf8');
console.log(`✨ Generated and saved ${numberOfWallets} wallet(s) to 'wallets.csv'`);
