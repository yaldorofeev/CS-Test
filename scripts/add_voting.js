const hre = require("hardhat");
require("dotenv").config();

let cand_accounts = [process.env.PUBLIC_KEY_CANDIDATE_2, process.env.PUBLIC_KEY_CANDIDATE_3];

async function addVoting(_cand_accounts) {

  // const accounts = await hre.ethers.getSigners();

  const votingContract = await hre.ethers.getContractAt("VotingContract", process.env.CONTRACT_ACCAUNT);

  const tx = await votingContract.addVoting(_cand_accounts);

  tx.wait();
}

addVoting(cand_accounts).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
