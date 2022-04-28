const hre = require("hardhat");
require("dotenv").config();

const cand_account = process.env.PUBLIC_KEY_CANDIDATE_3;
const cand_Name = "cond_3";
const cand_Program = "cand_prog_3"

async function addCandidate(_cand_account, _cand_Name, _cand_Program) {

  const votingContract = await hre.ethers.getContractAt("VotingContract", process.env.CONTRACT_ACCAUNT);

  const tx = await votingContract.addCondidate(_cand_account, _cand_Name, _cand_Program);

  tx.wait();


}

addCandidate(cand_account, cand_Name, cand_Program).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
