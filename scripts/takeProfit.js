const hre = require("hardhat");
require("dotenv").config();

// const amount = hre.ethers.utils.parseEther("0.001");
const amount = 0;

async function takeProfit(_amount) {
  const accounts = await hre.ethers.getSigners();
  const votingContract = await hre.ethers.getContractAt(
    "VotingContract",
    process.env.CONTRACT_ACCAUNT,
    accounts[2]
  );

  const tx = await votingContract.takeProfit(_amount);
  tx.wait();
}

takeProfit(amount).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
