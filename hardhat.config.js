require("@nomicfoundation/hardhat-toolbox");
// require("./contracts/Voting.sol");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",

  networks: {
    gochain_testnet: { // This name must match what you use in CLI
      url: "https://testnet-rpc.gochain.io", // GoChain Testnet RPC
      chainId: 31337, // GoChain Testnet Chain ID
      accounts: [process.env.PRIVATE_KEY], // Use environment variable for security
    },
  },
};
