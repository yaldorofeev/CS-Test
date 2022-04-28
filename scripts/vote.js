const hre = require("hardhat");
require("dotenv").config();

const cand_account = process.env.PUBLIC_KEY_CANDIDATE_2;
const voting_id = 0;

async function vote(_voting_id, _cand_account) {
  const options = {value: hre.ethers.utils.parseEther("0.01")}
  const accounts = await hre.ethers.getSigners();
  const votingContract = await hre.ethers.getContractAt(
    "VotingContract",
    process.env.CONTRACT_ACCAUNT,
    accounts[3]
  );

  const tx = await votingContract.vote(_voting_id, _cand_account, options);

  tx.wait();

}

vote(voting_id, cand_account).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
