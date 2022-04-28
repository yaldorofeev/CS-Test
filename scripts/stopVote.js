const hre = require("hardhat");
require("dotenv").config();

const voting_id = 2;

async function stopVote(_voting_id) {
  const accounts = await hre.ethers.getSigners();
  const votingContract = await hre.ethers.getContractAt(
    "VotingContract",
    process.env.CONTRACT_ACCAUNT,
    accounts[1]
  );

  await votingContract.stopVote(_voting_id);

}

stopVote(voting_id).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
