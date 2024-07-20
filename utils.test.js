const fs = require("fs")
jest.mock("fs")
const { parse } = require("csv-parse/sync")
jest.mock("csv-parse/sync", () => {
  return {
    parse: jest.fn((input, options) => {
      return [{ WalletAddress: "address" }]
    }),
  }
})
const { writeDataToFile, readWalletAddresses } = require("./utils")

describe("writeDataToFile", () => {
  it("writes JSON content to a file correctly", () => {
    const jsonData = [{ walletAddress: "test_address" }]
    const prefix = "wallets"
    const format = "json"
    writeDataToFile(prefix, jsonData, format)
    expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), JSON.stringify(jsonData, null, 2), "utf8")
  })

  it("writes CSV content to a file correctly", () => {
    const csvData = "Mnemonic,PrivateKey,WalletAddress\n"
    const prefix = "wallets"
    const format = "csv"
    writeDataToFile(prefix, csvData, format)
    expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), csvData, "utf8")
  })
})

describe("readWalletAddresses", () => {
  it("should read addresses from a CSV file correctly", () => {
    fs.readFileSync.mockReturnValue("Mnemonic,PrivateKey,WalletAddress\nphrase,key,address")
    const filePath = "wallets.csv"
    const addresses = readWalletAddresses(filePath)
    expect(addresses).toEqual(["address"])
  })

  it("should read addresses from a JSON file correctly", () => {
    const jsonData = JSON.stringify([{ walletAddress: "test_address" }])
    fs.readFileSync.mockReturnValue(jsonData)
    const filePath = "wallets.json"
    const addresses = readWalletAddresses(filePath)
    expect(addresses).toEqual(["test_address"])
  })
})
