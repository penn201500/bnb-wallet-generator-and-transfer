
# Wallet Generator and Transfer Utility

This Node.js project includes tools for generating Binance Smart Chain (BSC) wallets and transferring BNB across these wallets. The wallet generator creates BSC wallets including a mnemonic, a private key, and a wallet address, with options for CSV or JSON output. The transfer utility facilitates sending BNB from a single sender to multiple recipients efficiently.

## Prerequisites

- Node.js installed (v12.x or higher recommended. It's tested on v22.4.1)
- npm (Node Package Manager)

## Installation

First, clone this repository or download the source code. Navigate to the project directory and install the required dependencies:

```bash
git clone https://github.com/penn201500/bnb-wallet-generator-and-transfer.git
cd bnb-wallet-generator-and-transfer
npm install
```

## Usage

### Wallet Generator

To run the wallet generator:

```bash
node generator.js [number-of-wallets] [format]
```

- `[number-of-wallets]` (optional): The number of wallets to generate. Defaults to 1 if not specified.
- `[format]` (optional): The output format of the wallet data (`csv` or `json`). Defaults to `csv` if not specified.

#### Examples

Generate a single wallet in CSV format:

```bash
node generator.js
```

Generate 5 wallets in JSON format:

```bash
node generator.js 5 json
```

### BNB Transfer Utility

The `transfer.js` script is now fully operational, allowing the transfer of BNB from a single sender to multiple recipients:

To use the transfer utility:

```bash
node transfer.js [sender] [wallet-file] [amount]
```

- `[sender]`: Wallet address of the sender.
- `[wallet-file]`: Path to the file containing recipient addresses (supports both CSV and JSON formats).
- `[amount]`: Amount of BNB to send to each recipient.

#### Example

Transfer 0.00002 BNB to multiple recipients listed in a file:

```bash
node transfer.js 0xe0C07BcDd1b2050E3Eb7932FcB6CC111A7933D21 wallets_2024-07-20_19-57-53.csv 0.00002
```

### BNB Retrieval Utility

The `retrieveFunds.js` script allows for the retrieval of BNB from multiple wallets back to a central wallet efficiently:

To use the retrieval utility:

```bash
node retrieveFunds.js [wallet-file] [central-wallet-address]
```

- `[wallet-file]`: Path to the file containing wallets from which to retrieve BNB.
- `[central-wallet-address]`: Wallet address to which all BNB will be retrieved.

#### Example

Retrieve BNB from multiple wallets:

```bash
node retrieveFunds.js wallets_2024-07-20_19-57-53.csv 0xe0C07BcDd1b2050E3Eb7932FcB6CC111A7933D21
```

## Output

- Wallet generator outputs wallet details to a file named `wallets_YYYY-MM-DD_HH-MM-SS.csv` or `.json` as per the format specified.
- Transfer utility logs transactions and saves details to `transactions_YYYY-MM-DD_HH-MM-SS.csv` or `.json` as per the format specified.
- Retrieval utility logs transactions and saves details to `retrieveFunds_YYYY-MM-DD_HH-MM-SS.csv` or `.json` as per the format specified.

*Below is an example of how you can specify the output format in the script:*

```javascript
// You can update the format in transfer.js
let format = 'csv'; // This sets the output format to CSV
```

## Notes and Warnings

- **Network Specific**: The scripts have been tested only on the BSC Testnet. If you plan to use them on other blockchains or with different tokens, thorough testing on those networks is essential to ensure compatibility and safety.
- **Security Advice**: Handle sensitive information with care. Private keys and mnemonics generated by these tools should be kept secure and not exposed publicly.

## Contributing

Contributions are welcome. Please fork the repository and submit a pull request with your changes or improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
