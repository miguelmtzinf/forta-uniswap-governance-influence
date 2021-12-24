import {
  exist,
  get,
  getVoters,
  getVoteCast,
  getStartBlock,
  getEndBlock,
  getProposalIdsWithEndBlockGreaterThan,
  initProposal,
  addVote,
  setBalanceIncreaseBeforeProposal,
  getBalanceIncreaseBeforeProposal,
  setBalanceDecreaseAfterProposal,
  getBalanceDecreaseAfterProposal,
} from "../src/store-repository";

describe("store repository management", () => {
  const onGoingStore: any = {};

  it("add a new proposal", async () => {
    const id = "0";

    expect(exist("0")).toBeFalsy;
    expect(get(id)).toBeUndefined;
    expect(getVoters(id)).toStrictEqual([]);
    expect(getStartBlock(id)).toBe("0");
    expect(getEndBlock(id)).toBe("0");
    expect(getProposalIdsWithEndBlockGreaterThan(1000)).toStrictEqual([]);

    initProposal(id, "1000", "1001");

    onGoingStore[id] = {
      startBlock: "1000",
      endBlock: "1001",
      votes: {},
    };

    expect(exist("0")).toBeTruthy;
    expect(get(id)).toStrictEqual(onGoingStore[id]);
    expect(getVoters(id)).toStrictEqual([]);
    expect(getStartBlock(id)).toBe(onGoingStore[id].startBlock);
    expect(getEndBlock(id)).toBe(onGoingStore[id].endBlock);
    expect(getProposalIdsWithEndBlockGreaterThan(1000)).toStrictEqual(["0"]);
    expect(getProposalIdsWithEndBlockGreaterThan(1002)).toStrictEqual([]);
  });

  it("add a new against vote to proposal", async () => {
    const id = "0";
    const voter = "voter1";

    addVote(id, voter, "3000", "against", 10001);

    onGoingStore[id].votes[voter] = {
      votes: "3000",
      support: "against",
      blockNumber: 10001,
      isBalanceIncreaseBeforeProposal: false,
      balanceIncreaseBeforeProposal: "",
      isBalanceDecreaseAfterProposal: false,
      balanceDecreaseAfterProposal: "",
    };
    expect(get(id)).toStrictEqual(onGoingStore[id]);
    expect(getVoters(id)).toStrictEqual(Object.keys(onGoingStore[id].votes));
    expect(getStartBlock(id)).toBe(onGoingStore[id].startBlock);
    expect(getEndBlock(id)).toBe(onGoingStore[id].endBlock);
    expect(getProposalIdsWithEndBlockGreaterThan(1000)).toStrictEqual(["0"]);
    expect(getProposalIdsWithEndBlockGreaterThan(1002)).toStrictEqual([]);
    expect(getBalanceIncreaseBeforeProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceIncreaseBeforeProposal,
    ]);
    expect(getBalanceDecreaseAfterProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceDecreaseAfterProposal,
    ]);
    expect(getVoteCast(id, voter)).toStrictEqual(onGoingStore[id].votes[voter]);
  });

  it("add a new for vote from same voter to proposal", async () => {
    const id = "0";
    const voter = "voter1";

    addVote(id, voter, "4000", "for", 10002);

    onGoingStore[id].votes[voter] = {
      votes: "4000",
      support: "for",
      blockNumber: 10002,
      isBalanceIncreaseBeforeProposal: false,
      balanceIncreaseBeforeProposal: "",
      isBalanceDecreaseAfterProposal: false,
      balanceDecreaseAfterProposal: "",
    };
    expect(get(id)).toStrictEqual(onGoingStore[id]);
    expect(getVoters(id)).toStrictEqual(Object.keys(onGoingStore[id].votes));
    expect(getStartBlock(id)).toBe(onGoingStore[id].startBlock);
    expect(getEndBlock(id)).toBe(onGoingStore[id].endBlock);
    expect(getProposalIdsWithEndBlockGreaterThan(1000)).toStrictEqual(["0"]);
    expect(getProposalIdsWithEndBlockGreaterThan(1002)).toStrictEqual([]);
    expect(getBalanceIncreaseBeforeProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceIncreaseBeforeProposal,
    ]);
    expect(getBalanceDecreaseAfterProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceDecreaseAfterProposal,
    ]);
    expect(getVoteCast(id, voter)).toStrictEqual(onGoingStore[id].votes[voter]);
  });

  it("add a new abstain vote from voter2 to proposal", async () => {
    const id = "0";
    const voter = "voter2";

    addVote(id, voter, "3000", "abstain", 10002);

    onGoingStore[id].votes[voter] = {
      votes: "3000",
      support: "abstain",
      blockNumber: 10002,
      isBalanceIncreaseBeforeProposal: false,
      balanceIncreaseBeforeProposal: "",
      isBalanceDecreaseAfterProposal: false,
      balanceDecreaseAfterProposal: "",
    };
    expect(get(id)).toStrictEqual(onGoingStore[id]);
    expect(getVoters(id)).toStrictEqual(Object.keys(onGoingStore[id].votes));
    expect(getStartBlock(id)).toBe(onGoingStore[id].startBlock);
    expect(getEndBlock(id)).toBe(onGoingStore[id].endBlock);
    expect(getProposalIdsWithEndBlockGreaterThan(1000)).toStrictEqual(["0"]);
    expect(getProposalIdsWithEndBlockGreaterThan(1002)).toStrictEqual([]);
    expect(getBalanceIncreaseBeforeProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceIncreaseBeforeProposal,
    ]);
    expect(getBalanceDecreaseAfterProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceDecreaseAfterProposal,
    ]);
    expect(getVoteCast(id, voter)).toStrictEqual(onGoingStore[id].votes[voter]);
  });

  it("add a new proposal and an against vote from voter3", async () => {
    const id = "1";
    const voter = "voter3";

    const id2 = "1";
    const voter2 = "voter3";

    initProposal(id2, "4000", "5000");
    addVote(id2, voter2, "3000", "abstain", 10003);

    onGoingStore[id2] = {
      startBlock: "4000",
      endBlock: "5000",
      votes: {
        [voter2]: {
          votes: "3000",
          support: "abstain",
          blockNumber: 10003,
          isBalanceIncreaseBeforeProposal: false,
          balanceIncreaseBeforeProposal: "",
          isBalanceDecreaseAfterProposal: false,
          balanceDecreaseAfterProposal: "",
        },
      },
    };

    // Existing
    expect(get(id)).toStrictEqual(onGoingStore[id]);
    expect(getVoters(id)).toStrictEqual(Object.keys(onGoingStore[id].votes));
    expect(getStartBlock(id)).toBe(onGoingStore[id].startBlock);
    expect(getEndBlock(id)).toBe(onGoingStore[id].endBlock);
    expect(getProposalIdsWithEndBlockGreaterThan(1000)).toStrictEqual([
      "0",
      "1",
    ]);
    expect(getProposalIdsWithEndBlockGreaterThan(1002)).toStrictEqual(["1"]);
    expect(getBalanceIncreaseBeforeProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceIncreaseBeforeProposal,
    ]);
    expect(getBalanceDecreaseAfterProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceDecreaseAfterProposal,
    ]);
    expect(getVoteCast(id, voter)).toStrictEqual(onGoingStore[id].votes[voter]);

    // New
    expect(get(id2)).toStrictEqual(onGoingStore[id]);
    expect(getVoters(id2)).toStrictEqual(Object.keys(onGoingStore[id].votes));
    expect(getStartBlock(id2)).toBe(onGoingStore[id].startBlock);
    expect(getEndBlock(id2)).toBe(onGoingStore[id].endBlock);
    expect(getProposalIdsWithEndBlockGreaterThan(5000)).toStrictEqual([]);
    expect(getBalanceIncreaseBeforeProposal(id2, voter2)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceIncreaseBeforeProposal,
    ]);
    expect(getBalanceDecreaseAfterProposal(id2, voter2)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceDecreaseAfterProposal,
    ]);
    expect(getVoteCast(id2, voter2)).toStrictEqual(
      onGoingStore[id].votes[voter]
    );
  });

  it("balanceIncreaseBeforeProposal for proposal0 voter1", async () => {
    const id = "1";
    const voter = "voter3";

    setBalanceIncreaseBeforeProposal(id, voter, "2000");

    onGoingStore[id].votes[voter].balanceIncreaseBeforeProposal = "2000";
    onGoingStore[id].votes[voter].isBalanceIncreaseBeforeProposal = true;

    expect(get(id)).toStrictEqual(onGoingStore[id]);
    expect(getVoters(id)).toStrictEqual(Object.keys(onGoingStore[id].votes));
    expect(getStartBlock(id)).toBe(onGoingStore[id].startBlock);
    expect(getEndBlock(id)).toBe(onGoingStore[id].endBlock);
    expect(getProposalIdsWithEndBlockGreaterThan(1000)).toStrictEqual([
      "0",
      "1",
    ]);
    expect(getProposalIdsWithEndBlockGreaterThan(1002)).toStrictEqual(["1"]);
    expect(getBalanceIncreaseBeforeProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceIncreaseBeforeProposal,
      onGoingStore[id].votes[voter].balanceIncreaseBeforeProposal,
    ]);
    expect(getBalanceDecreaseAfterProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceDecreaseAfterProposal,
    ]);
    expect(getVoteCast(id, voter)).toStrictEqual(onGoingStore[id].votes[voter]);
  });

  it("setBalanceDecreaseAfterProposal for proposal1 voter3", async () => {
    const id = "1";
    const voter = "voter3";

    setBalanceDecreaseAfterProposal(id, voter, "1000");

    onGoingStore[id].votes[voter].balanceDecreaseAfterProposal = "1000";
    onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal = true;

    expect(get(id)).toStrictEqual(onGoingStore[id]);
    expect(getVoters(id)).toStrictEqual(Object.keys(onGoingStore[id].votes));
    expect(getStartBlock(id)).toBe(onGoingStore[id].startBlock);
    expect(getEndBlock(id)).toBe(onGoingStore[id].endBlock);
    expect(getProposalIdsWithEndBlockGreaterThan(1000)).toStrictEqual([
      "0",
      "1",
    ]);
    expect(getProposalIdsWithEndBlockGreaterThan(1002)).toStrictEqual(["1"]);
    expect(getBalanceIncreaseBeforeProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceIncreaseBeforeProposal,
      onGoingStore[id].votes[voter].balanceIncreaseBeforeProposal,
    ]);
    expect(getBalanceDecreaseAfterProposal(id, voter)).toStrictEqual([
      onGoingStore[id].votes[voter].isBalanceDecreaseAfterProposal,
      onGoingStore[id].votes[voter].balanceDecreaseAfterProposal,
    ]);
    expect(getVoteCast(id, voter)).toStrictEqual(onGoingStore[id].votes[voter]);
  });
});
