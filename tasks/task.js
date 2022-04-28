require("dotenv").config();
const { types } = require("hardhat/config")

task("addcandidate", "Add candidate to a contract")
  .addParam("account", "The account's address")
  .addParam("name", "The name of candidate")
  .addParam("program", "The program of candidate")
  .setAction(async (taskArgs, hre) => {

  const votingContract = await hre.ethers.getContractAt("VotingContract",
  process.env.CONTRACT_ACCAUNT);

  const tx = await votingContract.addCondidate(taskArgs.account, taskArgs.name, taskArgs.program);

  tx.wait();

});

task("editcandidate", "Edit candidate at a contract")
  .addParam("account", "The account's address")
  .addParam("name", "The name of candidate")
  .addParam("program", "The program of candidate")
  .setAction(async (taskArgs, hre) => {

  const votingContract = await hre.ethers.getContractAt("VotingContract",
  process.env.CONTRACT_ACCAUNT);

  const tx = await votingContract.editCondidate(taskArgs.account, taskArgs.name, taskArgs.program);

  tx.wait();

});

task("addvoting", "Add voting to a contract")
  .addParam("accounts", "Account's addresses of candidates in json format")
  .setAction(async (taskArgs, hre) => {
    console.log(taskArgs.accounts);
    const acarray = JSON.parse(taskArgs.accounts);
    console.log(acarray);
    const votingContract = await hre.ethers.getContractAt("VotingContract", process.env.CONTRACT_ACCAUNT);

    const tx = await votingContract.addVoting(acarray);

    tx.wait();

});

task("getinfo", "Get an actual votes info")
  .setAction(async (taskArgs, hre) => {

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

});

task("getamount", "Get owner amount")
  .setAction(async (taskArgs, hre) => {
    const votingContract = await hre.ethers.getContractAt(
      "VotingContract",
      process.env.CONTRACT_ACCAUNT,
    );

    const amount = await votingContract.getOwnerAmount();
    console.log(amount.toNumber());
    return amount.toNumber();

});

task("vote", "Vote for the candidate")
  .addParam("voteid", "ID of voting")
  .addParam("account", "Account's address of candidate")
  .setAction(async (taskArgs, hre) => {

    const options = {value: hre.ethers.utils.parseEther("0.01")}
    const accounts = await hre.ethers.getSigners();
    const votingContract = await hre.ethers.getContractAt(
      "VotingContract",
      process.env.CONTRACT_ACCAUNT,
      accounts[0]
    );

    const tx = await votingContract.vote(taskArgs.voteid, taskArgs.account, options);

    tx.wait();
});

task("stopvote", "Stop voting")
  .addParam("voteid", "ID of voting")
  .addParam("account", "Account's address of candidate")
  .setAction(async (taskArgs, hre) => {

    const accounts = await hre.ethers.getSigners();
    const votingContract = await hre.ethers.getContractAt(
      "VotingContract",
      process.env.CONTRACT_ACCAUNT,
      accounts[1]
    );

    const tx = await votingContract.stopVote(taskArgs.voteid);

    tx.wait();
});

task("takeprofit", "Get profit from the contract")
  .addParam("amount", "Requested amount")
  .setAction(async (taskArgs, hre) => {

    const accounts = await hre.ethers.getSigners();
    const votingContract = await hre.ethers.getContractAt(
      "VotingContract",
      process.env.CONTRACT_ACCAUNT,
      accounts[2]
    );

    const tx = await votingContract.takeProfit(taskArgs.amount);
    tx.wait();
});
