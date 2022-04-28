const hre = require("hardhat");
require("dotenv").config();

const cand_account = process.env.PUBLIC_KEY_CANDIDATE_3;
const cand_Name = "cand_3";
const cand_Program = "cand_prog_3"

async function editCandidate(_cand_account, _cand_Name, _cand_Program) {

  const accounts = await hre.ethers.getSigners();

  const votingContract = await hre.ethers.getContractAt("VotingContract", process.env.CONTRACT_ACCAUNT);

  const tx = await votingContract.editCondidate(_cand_account, _cand_Name, _cand_Program);

  tx.wait();

  // console.log(tx);
}

editCandidate(cand_account, cand_Name, cand_Program).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
