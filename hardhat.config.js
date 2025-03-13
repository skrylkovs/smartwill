require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: ["188847531e78255ea5ac9c27df97af99715a63a86b95e3dfa74b4925a4fdf93d"]
    }
  }
};