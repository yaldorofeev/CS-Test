require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("gas", "Gas price", async (taskArgs, hre) => {
  const provider = await hre.ethers.getDefaultProvider(process.env.ROPSTEN_URL);
  const n = await provider.getNetwork();
  console.log(n);
  const gasPrice = await provider.getGasPrice()
  console.log("Gas price: " + gasPrice.toNumber());

});


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {enabled: process.env.DEBUG ? false : true},
    },
  },
  defaultNetwork: "rinkeby",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL,
      accounts:
        process.env.PRIVATE_KEY_OWNER !== undefined ? [process.env.PRIVATE_KEY_OWNER, process.env.PRIVATE_KEY_VOTER_1, process.env.PRIVATE_KEY_VOTER_2, process.env.PRIVATE_KEY_VOTER_3] : [],
      gasMultiplier: 1.2
    },
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts:
        process.env.PRIVATE_KEY_OWNER !== undefined ? [process.env.PRIVATE_KEY_OWNER, process.env.PRIVATE_KEY_VOTER_1, process.env.PRIVATE_KEY_VOTER_2, process.env.PRIVATE_KEY_VOTER_3] : [],
      gasMultiplier: 1.2
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
