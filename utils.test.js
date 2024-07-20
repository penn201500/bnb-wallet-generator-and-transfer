const fs = require("fs")
jest.mock("fs")
const { stringify } = require("csv-stringify/sync")
jest.mock("csv-parse/sync", () => {
  return {
    parse: jest.fn((input, options) => {
      // Split the input into lines and create an object for each line using the headers
      const lines = input.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      return lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
        let result = {};
        headers.forEach((header, index) => {
          result[header] = values[index];
        });
        return result;
      });
    }),
  };
});
const { writeDataToFile, readWalletAddresses, generateRandomMnemonic } = require("./utils")

describe("Mnemonic Generation", () => {
  it("generates a valid 12-word mnemonic", () => {
    const mnemonic = generateRandomMnemonic()
    expect(mnemonic.split(" ").length).toBe(12)
  })
})

describe("writeDataToFile", () => {
  it("writes JSON wallet data to a file with timestamped name", () => {
    const walletData = [
      {
        mnemonic: "clean despair shuffle sibling hand angry skin whale warfare tank fruit soup",
        privateKey: "0xebcce3442418f3fe2514e11111911d5ea6d8f15555c9475e36f31766a83c56ca",
        walletAddress: "0xFe9d486e51b5ef3FBadeB73e2aCC546aFcC545d4",
      },
      {
        mnemonic: "jar gate drastic amazing artist stairs brown gloom edge leg prefer rather",
        privateKey: "0xdb5ab75858008cb7f8802beaddf734e443b577229aaf8ac285c36d10d2b6c84f",
        walletAddress: "0x336f43B2Afb0f89d01F0ac23E10eF8A78a56885f",
      },
    ]
    const fixedDate = new Date("2024-02-01T00:00:00Z") // mocking the current date
    jest.useFakeTimers().setSystemTime(fixedDate)

    // Format filename avoiding UTC conversion issues
    const expectedFileName = `wallets_${fixedDate.getFullYear()}-${String(fixedDate.getMonth() + 1).padStart(2, "0")}-${String(fixedDate.getDate()).padStart(2, "0")}_${String(fixedDate.getHours()).padStart(2, "0")}-${String(fixedDate.getMinutes()).padStart(2, "0")}-${String(
      fixedDate.getSeconds()
    ).padStart(2, "0")}.json`

    const prefix = "wallets"
    const format = "json"
    writeDataToFile(prefix, walletData, format)
    expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining(expectedFileName), JSON.stringify(walletData, null, 2), "utf8")
  })

  it("writes CSV content to a file correctly", () => {
    const walletData = [
      {
        mnemonic: "clean despair shuffle sibling hand angry skin whale warfare tank fruit soup",
        privateKey: "0xebcce3442418f3fe2514e11111911d5ea6d8f15555c9475e36f31766a83c56ca",
        walletAddress: "0xFe9d486e51b5ef3FBadeB73e2aCC546aFcC545d4",
      },
      {
        mnemonic: "jar gate drastic amazing artist stairs brown gloom edge leg prefer rather",
        privateKey: "0xdb5ab75858008cb7f8802beaddf734e443b577229aaf8ac285c36d10d2b6c84f",
        walletAddress: "0x336f43B2Afb0f89d01F0ac23E10eF8A78a56885f",
      },
    ]

    // Convert the array of objects to a CSV string
    const csvData = stringify(walletData, {
      header: true,
      columns: { mnemonic: "mnemonic", privateKey: "privateKey", walletAddress: "walletAddress" },
    })

    const prefix = "wallets"
    const format = "csv"
    const fixedDate = new Date("2024-02-01T00:00:00Z") // Mocking the current date
    jest.useFakeTimers().setSystemTime(fixedDate)
    const expectedFileName = `wallets_2024-02-01_08-00-00.csv`;

    writeDataToFile(prefix, csvData, format) // Assuming this function handles CSV formatting

    expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining(expectedFileName),  expect.stringContaining(csvData), "utf8")
  })
})

describe("readWalletAddresses", () => {
  it("should read addresses from a CSV file correctly", () => {
    const mockCSVData = `Mnemonic,PrivateKey,WalletAddress\n"bird moon","0x123","0x456"\n"cat sun","0x789","0xabc"`;
    fs.readFileSync.mockReturnValue(mockCSVData);
    const filePath = "wallets.csv";
    const addresses = readWalletAddresses(filePath);
    expect(addresses).toEqual(["0x456", "0xabc"]);
  });

  it("should read addresses from a JSON file correctly", () => {
    const mockJSONData = JSON.stringify([
      { walletAddress: "0x456" },
      { walletAddress: "0xabc" }
    ]);
    fs.readFileSync.mockReturnValue(mockJSONData);
    const filePath = "wallets.json";
    const addresses = readWalletAddresses(filePath, 'json'); // Assuming function needs format
    expect(addresses).toEqual(["0x456", "0xabc"]);
  });

  it("should handle file read errors", () => {
    fs.readFileSync.mockImplementation(() => {
      throw new Error("Failed to read file");
    });
    const filePath = "wallets.csv";
    expect(() => readWalletAddresses(filePath, 'csv')).toThrow("Failed to read file");
  });
});
