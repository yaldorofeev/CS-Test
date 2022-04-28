const hre = require("hardhat");
require("dotenv").config();


async function getOwnerAmount() {
  const accounts = await hre.ethers.getSigners();
  const votingContract = await hre.ethers.getContractAt(
    "VotingContract",
    process.env.CONTRACT_ACCAUNT,
    accounts[0]
  );

  const amount = await votingContract.getOwnerAmount();
  console.log(amount.toNumber());
  return amount.toNumber();
}

getOwnerAmount().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
