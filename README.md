
# Wallet Generator

This Node.js script generates Binance Smart Chain (BSC) wallets, including a mnemonic, a private key, and a wallet address. It can output the wallet details in either CSV or JSON format, based on user preference. Each execution generates wallet data with a timestamp in the filename to ensure uniqueness.

## Prerequisites

- Node.js installed (v12.x or higher recommended)
- npm (Node Package Manager)

## Installation

First, clone this repository or download the source code. Navigate to the project directory and install the required dependencies:

\```bash

git clone [https://github.com/penn201500/bnb-wallet-generator-and-transfer.git](https://github.com/penn201500/bnb-wallet-generator-and-transfer.git)

cd bnb-wallet-generator-and-transfer

npm install

\```

## Usage

To run the wallet generator:

\```bash

node generator.js [number-of-wallets] [format]

\```

- `[number-of-wallets]` (optional): The number of wallets to generate. Defaults to 1 if not specified.
- `[format]` (optional): The output format of the wallet data (`csv` or `json`). Defaults to `csv` if not specified.

### Examples

Generate a single wallet in CSV format:

\```bash

node generator.js

\```

Generate 5 wallets in JSON format:

\```bash

node generator.js 5 json

\```

## Output

The script outputs the wallet details to a file named `wallets_YYYY-MM-DD_HH-MM-SS.format` (where `.format` is either `.csv` or `.json` depending on the specified format). The file will be saved in the current directory.

Files like `wallets_*.csv` or `wallets_*.json` are configured to be ignored by Git as specified in the `.gitignore` file.

## Security Notes

- **Handle with care**: The generated wallet details include sensitive information. Ensure these details are handled securely, especially the private keys.
- **Do not upload sensitive data**: Be cautious about where you store or upload the generated files.

## Contributing

Contributions are welcome. Please fork the repository and submit a pull request with your changes or improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
