const hre = require("hardhat");
require("dotenv").config();

// In this unit funtion to agregate information about actual votings
// for using in app or sites is described; The function returns an array
// of that structure:
// [[voting_1], [voting_2], ...],
// where [voting_1] is [["id", voting_id], ["days", days], ["hours", hours], ["minutes", min],
// ["seconds", sec], ["candidates number", num], [[cand_1], [cand_2],...]
// where [cand_1] is [["address", cand_addr], ["candidate name", name], ["candidateProgram", program]]
// For clarity this array presented by log.table() function.
async function getActualVotesInfo() {

  const accounts = await hre.ethers.getSigners();

  const votingContract = await hre.ethers.getContractAt("VotingContract", process.env.CONTRACT_ACCAUNT, accounts[1]);

  const numberOfVotes = await votingContract.numberOfVotes();

  var actualVotes = new Array();
  // var vote;
  let votesInfo = new Array();


  for (var i = 0; i < numberOfVotes; i++) {
    let vote = await votingContract.votes(i);
    if (vote.actual) {
      actualVotes.push([i, vote]);
    }
  }

  for (var i = 0; i < actualVotes.length; i++) {
    let vote = new Array();
    let candidates = new Array();
    let t;
    t = await votingContract.getRemainingTime(actualVotes[i][0]);
    vote.push(["id", actualVotes[i][0]]);
    vote.push(["days", t[0].toNumber()]);
    vote.push(["hours", t[1].toNumber()]);
    vote.push(["minutes", t[2].toNumber()]);
    vote.push(["seconds", t[3].toNumber()]);
    c_n = actualVotes[i][1]["condidatesNumber"].toNumber();
    vote.push(["candidates number", c_n])
    for (var j = 0; j < c_n; j++) {
      const addr = await votingContract.getCandidateOnTheVote(actualVotes[i][0], j);
      let cand = new Array();
      cand.push(["address", addr]);
      let c = await votingContract.candidates(addr);
      let name = c["candidateName"];
      let prog = c["candidateProgram"];
      cand.push(["candidate name", name]);
      cand.push(["candidate program", prog]);
      let votesNum = await votingContract.votingBalance(actualVotes[i][0], addr);
      cand.push(["number of votes", votesNum.toNumber()]);
      candidates.push(cand);
    }
    candidates.push();
    vote.push(candidates);
    votesInfo.push(vote);
  }

  console.table(votesInfo, [0, 1, 2, 3, 4, 5]);

  for (var i = 0; i <  votesInfo.length; i++) {
    console.log("Candidetes of vote with id " + votesInfo[i][0][1]);
    console.table(votesInfo[i][6]);
  }

  return votesInfo;
}

getActualVotesInfo().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
