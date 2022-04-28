const { expect } = require("chai");
const { ethers } = require("hardhat");

let votingContract;
let owner;
let addrCand1;
let addrCand2;
let addrCand3;
let addrVoter1;
let addrVoter2;
let addrVoter3;
let addrVoter4;
let addrVoter5;
let addrVoter6;
let someUser;

let voteId1;
let voteId2;
let candAddr1_1;
let candAddr2_1;
let candAddr1_2;
let candAddr2_2;
let candAddr3_2;

describe("Initialize VotingContract and prepare for voting", function () {
  it("Should test the initial state of VotingContract", async function () {
    [owner, addrCand1, addrCand2, addrCand3, addrVoter1, addrVoter2, addrVoter3, addrVoter4, addrVoter5, addrVoter6, someUser] = await ethers.getSigners();
    const VotingContract = await ethers.getContractFactory("VotingContract", owner);
    votingContract = await VotingContract.deploy("BestVote", "BV");
    await votingContract.deployed();
    expect(await votingContract.votingPrice()).to.equal(ethers.utils.parseEther("0.01"));
    expect(await votingContract.numberOfVotes()).to.equal(0);
    expect(await votingContract.commission()).to.equal(10);
    expect(await votingContract.limitDays()).to.equal(3);
    expect(await votingContract.name()).to.equal("BestVote");
    expect(await votingContract.symbol()).to.equal("BV");
    expect(await votingContract.getOwnerAmount()).to.equal(0);
  });

  it("Should test the adding candidates in the contract", async function () {
    // Adding candidates
    await votingContract.addCondidate(addrCand1.getAddress(), "cand1", 'cand1 Program');
    await votingContract.addCondidate(addrCand2.getAddress(), "Cand2", 'Cand2 Program');
    // Try to re-add a candidate at the addrCand2;
    await expect(votingContract.addCondidate(addrCand2.getAddress(), "Cand125", 'Cand125 Program')).to.be.revertedWith("This condidate is already on the list");
    await expect(votingContract.addCondidate(addrCand3.getAddress(), "", 'Cand3 Program')).to.be.revertedWith("The candidate must have a name");
    // Check the candidate at addrCand1
    const _cond1 = await votingContract.candidates(addrCand1.getAddress());
    expect(_cond1.candidateName).to.equal("cand1");
    expect(_cond1.candidateProgram).to.equal("cand1 Program");
    // Check the candidate at addrCand2
    const _cond2 = await votingContract.candidates(addrCand2.getAddress());
    expect(_cond2.candidateName).to.equal("Cand2");
    expect(_cond2.candidateProgram).to.equal("Cand2 Program");
    // Check the candidate at addrCand3
    var _cond3 = await votingContract.candidates(addrCand3.getAddress());
    expect(_cond3.candidateName).to.equal("");
    expect(_cond3.candidateProgram).to.equal("");
    await votingContract.addCondidate(addrCand3.getAddress(), "Cand3", "Cand3 Program");
    _cond3 = await votingContract.candidates(addrCand3.getAddress());
    expect(_cond3.candidateName).to.equal("Cand3");
    expect(_cond3.candidateProgram).to.equal("Cand3 Program");
  });

  it("Should test the editing candidates in the contract", async function () {
    // Try to edit "none" candidate
    await expect(votingContract.editCondidate(addrVoter1.getAddress(), "Cand1", 'Cand1 Program')).to.be.revertedWith("There is no condidate with this address");
    // Try to edit candidate "addrCand1"
    await votingContract.editCondidate(addrCand1.getAddress(), "Cand1", 'Cand1 Program');
    const _cond1 = await votingContract.candidates(addrCand1.getAddress());
    expect(_cond1.candidateName).to.equal("Cand1");
    expect(_cond1.candidateProgram).to.equal("Cand1 Program");
  });

  it("Should test the calls to 'onlyowner functions' from non-owner accounts", async function () {
    const contract = votingContract.connect(someUser);
    await expect(contract.addCondidate(addrCand2.getAddress(), "Cand125", 'Cand125 Program')).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(contract.editCondidate(addrCand2.getAddress(), "Cand125", 'Cand125 Program')).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(contract.addVoting([addrCand2.getAddress()])).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(contract.getOwnerAmount()).to.be.revertedWith("missing revert data in call exception");
    await expect(contract.takeProfit(1)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should test getOwnerAmount()", async function () {
    const amount = await votingContract.getOwnerAmount();
    expect(amount).to.be.not.undefined;
    expect(amount).to.be.not.null;
    expect(amount.toNumber()).to.equal(0);
  });
});

describe("Test addVoting() and request information about added votes", function () {
  let contract;

  it("Add new two votes with two days delay (candidates are already in contract)", async function () {
    await votingContract.addVoting([addrCand1.getAddress(), addrCand2.getAddress()]);
    twodays = 2 * 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [twodays]);
    await ethers.provider.send('evm_mine');
    await votingContract.addVoting([addrCand1.getAddress(), addrCand2.getAddress(), addrCand3.getAddress()]);
    halfday = 12 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [halfday]);
    await ethers.provider.send('evm_mine');
  });

  it("Should get actual votes", async function () {
    //Use not owner accaunt
    //Request of ids of votes
    contract = votingContract.connect(someUser);
    const numberOfVotes = await contract.numberOfVotes();
    expect(numberOfVotes).to.equal(2);
    voteId1 = 0;
    const vote1 = await contract.votes(voteId1);
    expect(vote1["actual"]).to.equal(true);
    voteId2 = 1;
    const vote2 = await contract.votes(voteId2);
    expect(vote2["actual"]).to.equal(true);
  });

  it("Should get information about 1st vote)", async function () {
    const vote1 = await contract.votes(voteId1);
    expect(vote1["condidatesNumber"]).to.equal(2);
    expect(vote1["votersNumber"]).to.equal(0);
    expect(vote1["amount"]).to.equal(0);
    candAddr1_1 = await contract.getCandidateOnTheVote(voteId1, 0);
    candAddr2_1 = await contract.getCandidateOnTheVote(voteId1, 1);
    expect(candAddr1_1).to.equal(await addrCand1.getAddress())
  });

  it("Should get information about one of candidates of 1st vote", async function () {
    const cand = await contract.candidates(candAddr1_1);
    expect(cand["candidateName"]).to.equal("Cand1");
    expect(cand["candidateProgram"]).to.equal("Cand1 Program");
  });

  it("Should get information about 2st vote)", async function () {
    const vote2 = await contract.votes(voteId2);
    expect(vote2["condidatesNumber"]).to.equal(3);
    expect(vote2["votersNumber"]).to.equal(0);
    expect(vote2["amount"]).to.equal(0);
    candAddr1_2 = await contract.getCandidateOnTheVote(voteId2, 0);
    candAddr2_2 = await contract.getCandidateOnTheVote(voteId2, 1);
    candAddr3_2 = await contract.getCandidateOnTheVote(voteId2, 2);
    expect(candAddr3_2).to.equal(await addrCand3.getAddress())
  });

  it("Should get information about one of candidates of 1st vote", async function () {
    const cand = await contract.candidates(candAddr3_2);
    expect(cand["candidateName"]).to.equal("Cand3");
    expect(cand["candidateProgram"]).to.equal("Cand3 Program");
  });

  it("Should test the add vote with an incorrect candidate", async function () {
    await expect(votingContract.addVoting([addrCand1.getAddress(), someUser.getAddress(), addrCand2.getAddress()])).to.be.revertedWith("The accaunt of one of a candidate is not correct");
  });
});

describe("Test vote()", function () {
  let contract;
  it("Should test the voting with incorrect parametrs", async function () {
    contract = votingContract.connect(addrVoter1);
    const incorrvoteId = 3;
    const incoroptions = {value: ethers.utils.parseEther("1.0")}
    const incorrcandAddr = candAddr3_2;
    await expect(contract.vote(incorrvoteId, candAddr1_1, incoroptions)).to.be.revertedWith("There is no vote with this id");
    await expect(contract.vote(voteId1, incorrcandAddr, incoroptions)).to.be.revertedWith("This candidate is not particepating in this vote");
    await expect(contract.vote(voteId1, candAddr1_1, incoroptions)).to.be.revertedWith("Not enaught or too much ethers");
    // Vote and re-vote from the same accaunt
    const options = {value: ethers.utils.parseEther("0.01")}
    await contract.vote(voteId1, candAddr1_1, options);
    await expect(contract.vote(voteId1, candAddr2_1, options)).to.be.revertedWith("You already voted");
    // Vote when time is over
    oneday = 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [oneday]);
    await ethers.provider.send('evm_mine');
    await expect(contract.vote(voteId1, candAddr2_1, options)).to.be.revertedWith("This vote is over");
  });

  it("Should test the voting when time is over", async function () {
    contract = votingContract.connect(addrVoter2);
    const options = {value: ethers.utils.parseEther("0.01")}
    oneday = 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [oneday]);
    await ethers.provider.send('evm_mine');
    await expect(contract.vote(voteId1, candAddr1_1, options)).to.be.revertedWith("This vote is over");
  });

  it("Voting for following tests and testing events emmiting", async function () {
    const options = {value: ethers.utils.parseEther("0.01")}
    contract = votingContract.connect(addrVoter1);
    await expect(contract.vote(voteId2, candAddr1_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId2);
    contract = votingContract.connect(addrVoter2);
    await expect(contract.vote(voteId2, candAddr2_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId2);
    contract = votingContract.connect(addrVoter3);
    await expect(contract.vote(voteId2, candAddr3_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId2);
    contract = votingContract.connect(addrVoter4);
    await expect(contract.vote(voteId2, candAddr2_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId2);
    contract = votingContract.connect(addrVoter5);
    await expect(contract.vote(voteId2, candAddr2_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId2);
    contract = votingContract.connect(addrVoter6);
    await expect(contract.vote(voteId2, candAddr3_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId2);
  });

  it("Should test the state of the vote after votings", async function () {
    const vote = await votingContract.votes(voteId2);
    expect(vote["votersNumber"]).to.equal(6);
    expect(vote["amount"]).to.equal(ethers.utils.parseEther("0.06"));
    let voteN = await votingContract.votingBalance(voteId2, candAddr1_2);
    expect(voteN).to.equal(1);
    voteN = await votingContract.votingBalance(voteId2, candAddr2_2);
    expect(voteN).to.equal(3);
    voteN = await votingContract.votingBalance(voteId2, candAddr3_2);
    expect(voteN).to.equal(2);
  });
});

describe("Test stopVote()", function () {
  let contract;
  it("Should test the stop of 1st voting in which only one candidate have a vote", async function () {
    contract = votingContract.connect(someUser);
    await votingContract.stopVote(voteId1);
    const amount = await votingContract.getOwnerAmount();
    expect(amount.toNumber()).to.equal(ethers.utils.parseEther("0.001"));
    expect(await addrCand1.getBalance()).to.equal(ethers.utils.parseEther("10000.009"));
  });

  it("Should test the stop of 2st voting when not yet time", async function () {
    await expect(contract.stopVote(voteId2)).to.be.revertedWith("Not yet time");
  });

  it("Should test the stop of 2st voting", async function () {
    oneday = 25 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [oneday]);
    await ethers.provider.send('evm_mine');
    await votingContract.stopVote(voteId2);
    const amount = await votingContract.getOwnerAmount();
    expect(amount.toNumber()).to.equal(ethers.utils.parseEther("0.007"));
    expect(await addrCand2.getBalance()).to.equal(ethers.utils.parseEther("10000.054"));
  });

  it("Should test the stop of a vote in which nobady voted", async function () {
    await votingContract.addVoting([addrCand1.getAddress(), addrCand2.getAddress(), addrCand3.getAddress()]);
    const voteId = await votingContract.numberOfVotes() - 1;
    const threeday = 3 * 24 * 60 * 60 + 3600;
    await ethers.provider.send('evm_increaseTime', [threeday]);
    await ethers.provider.send('evm_mine');
    const amountBefore = await votingContract.getOwnerAmount();
    await contract.stopVote(voteId);
    const amount = await votingContract.getOwnerAmount();
    expect(amount.toNumber()).to.equal(amountBefore);
  });

  it("Should test the stop of a stopped vote", async function () {
    const voteId = await contract.numberOfVotes() - 1;
    await expect(contract.stopVote(voteId)).to.be.revertedWith("The vote was already stopped");
  });

  it("Should test the remining time of stopped vote", async function () {
    const voteId = await contract.numberOfVotes() - 1;
    await expect(contract.stopVote(voteId)).to.be.revertedWith("The vote was already stopped");
  });

  it("Should test the stop of a vote in which two winners", async function () {
    await votingContract.addVoting([addrCand1.getAddress(), addrCand2.getAddress(), addrCand3.getAddress()]);
    const voteId = await votingContract.numberOfVotes() - 1;

    const options = {value: ethers.utils.parseEther("0.01")}
    contract = votingContract.connect(addrVoter1);
    await expect(contract.vote(voteId, candAddr2_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId);
    contract = votingContract.connect(addrVoter2);
    await expect(contract.vote(voteId, candAddr2_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId);
    contract = votingContract.connect(addrVoter3);
    await expect(contract.vote(voteId, candAddr3_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId);
    contract = votingContract.connect(addrVoter4);
    await expect(contract.vote(voteId, candAddr2_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId);
    contract = votingContract.connect(addrVoter5);
    await expect(contract.vote(voteId, candAddr3_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId);
    contract = votingContract.connect(addrVoter6);
    await expect(contract.vote(voteId, candAddr3_2, options)).to.emit(contract, 'yourVoteCounted').withArgs(voteId);

    const threeday = 3 * 24 * 60 * 60 + 3600;
    await ethers.provider.send('evm_increaseTime', [threeday]);
    await ethers.provider.send('evm_mine');
    await contract.stopVote(voteId);
  });
});

describe("Test takeProfit()", function () {
  let contract;
  let amountAft;
  it("Should test transfer to owner", async function () {
    const ownerAmount = await owner.getBalance();
    const amount = await votingContract.getOwnerAmount();
    await expect(votingContract.takeProfit(amount + amount)).to.be.revertedWith("The amount requested is too high");
    const tx = await votingContract.takeProfit(amount.div(2));
    amountAft = await votingContract.getOwnerAmount();
    expect(amountAft).to.equal(amount.sub(amount.div(2)));
  });

  it("Should test transfer when nothing to transfer", async function () {
    const tx = await votingContract.takeProfit(amountAft);
    await expect(votingContract.takeProfit(ethers.utils.parseEther("0.01"))).to.be.revertedWith("Nothing to take");
  });
});

describe("Test getRemainingTime()", function () {
  let days;
  let hours;
  let minutes;
  let seconds;
  let voteId;

  it("Create new vote", async function () {
    await votingContract.addVoting([addrCand1.getAddress(), addrCand2.getAddress(), addrCand3.getAddress()]);
    voteId = await votingContract.numberOfVotes() - 1;
  });

  it("Test after creation ", async function () {
    // 3:00:00:00
    [days, hours, minutes, seconds] = await votingContract.getRemainingTime(voteId);
    expect(days).to.equal(3);
    expect(hours).to.equal(0);
    expect(minutes).to.equal(0);
    expect(seconds).to.equal(0);
  });

  it("Test after creation (5 minutes later)", async function () {
    // 2:23:55:00
    const stime = 5 * 60;
    await ethers.provider.send('evm_increaseTime', [stime]);
    await ethers.provider.send('evm_mine');
    [days, hours, minutes, seconds] = await votingContract.getRemainingTime(voteId);
    expect(days).to.equal(2);
    expect(hours).to.equal(23);
    expect(minutes).to.equal(55);
    expect(seconds).to.equal(0);
  });

  it("Test after two more days", async function () {
    // 0:23:55:00
    const stime = 2 * 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [stime]);
    await ethers.provider.send('evm_mine');
    [days, hours, minutes, seconds] = await votingContract.getRemainingTime(voteId);
    expect(days).to.equal(0);
    expect(hours).to.equal(23);
    expect(minutes).to.equal(55);
    expect(seconds).to.equal(0);
  });

  it("Test after 23 hours", async function () {
    // 0:00:54:59
    const stime = 23 * 60 * 60 + 1;
    await ethers.provider.send('evm_increaseTime', [stime]);
    await ethers.provider.send('evm_mine');
    [days, hours, minutes, seconds] = await votingContract.getRemainingTime(voteId);
    expect(days).to.equal(0);
    expect(hours).to.equal(0);
    expect(minutes).to.equal(54);
    expect(seconds).to.equal(59);
  });

  it("Test after 55 minuts", async function () {
    // 0:00:00:59
    const stime = 54 * 60;
    await ethers.provider.send('evm_increaseTime', [stime]);
    await ethers.provider.send('evm_mine');
    [days, hours, minutes, seconds] = await votingContract.getRemainingTime(voteId);
    expect(days).to.equal(0);
    expect(hours).to.equal(0);
    expect(minutes).to.equal(0);
    expect(seconds).to.equal(59);
  });

  it("Test after 60 seconds", async function () {
    // - 0:00:00:01 (0:00:00:00)
    const stime =  60;
    await ethers.provider.send('evm_increaseTime', [stime]);
    await ethers.provider.send('evm_mine');
    [days, hours, minutes, seconds] = await votingContract.getRemainingTime(voteId);
    expect(days).to.equal(0);
    expect(hours).to.equal(0);
    expect(minutes).to.equal(0);
    expect(seconds).to.equal(0);
  });

  it("Test with incorrect votingId", async function () {
    const incVoteId = await votingContract.numberOfVotes();
    await expect(votingContract.getRemainingTime(incVoteId)).to.be.revertedWith("There is no vote with this id");
  });
});
