require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: ["2b56ce53f71b7614a715790088558cc36cef0bdcbe823da48d16c02be831ce30"]
    }
  }
};