import { createAddress, TestTransactionEvent } from "forta-agent-tools";
import { BigNumber } from "ethers";
import {
  buildFindingResult2,
  buildFindingResult3,
  createDelegateVotesChangedTx,
  createProposalCreatedTx,
  createVoteCastTx,
} from "./helpers";

import governanceStartVotingAgent from "../src/governance-start-voting";
import governanceCastVoteAgent from "../src/governance-cast-vote";
import governanceEndVotingAgent from "../src/governance-end-voting";

describe("governance proposal end voting", () => {
  let handleTransaction: any;

  const mockGetNumberOfCheckpoints = jest.fn();
  const mockGetVoterPowerAtCheckpoint = jest.fn();

  const mockConfig = {
    observationPeriodBeforeVoting: 100,
    observationPeriodAfterVoting: 100,
    votingPowerChangeThreshold: "10",
  };

  const proposalIds = [10000001, 10000002, 10000003, 10000004];
  const voters = [
    createAddress("0x10001"),
    createAddress("0x10002"),
    createAddress("0x10003"),
    createAddress("0x10004"),
  ];
  const voteTypes = [0, 1, 2]; // ["against", "for", "abstain"];
  const startBlocks = [10, 100];
  const endBlocks = [20, 200];
  const votes = [100, 200, 300, 400];

  beforeAll(() => {
    handleTransaction = governanceEndVotingAgent.handleTransaction;
  });

  beforeEach(() => {
    mockConfig.observationPeriodBeforeVoting = 100;
    mockConfig.observationPeriodAfterVoting = 100;
    mockConfig.votingPowerChangeThreshold = "10";

    mockGetNumberOfCheckpoints.mockReturnValue(
      new Promise((resolve) => resolve(0))
    );
  });

  afterEach(() => {
    mockGetNumberOfCheckpoints.mockReset();
    mockGetVoterPowerAtCheckpoint.mockReset();
  });

  it("returns 0 findings since there are no voting power changed events", async () => {
    const basicTxEvent = new TestTransactionEvent();

    const findings = await handleTransaction(basicTxEvent, mockConfig);

    expect(findings).toStrictEqual([]);
  });

  it("returns 0 findings since there are voting power changed events but no proposals or votes", async () => {
    const txEvent = createDelegateVotesChangedTx(voters[0], 100, 50, 25);

    const findings = await handleTransaction(txEvent, mockConfig);

    expect(findings).toStrictEqual([]);
  });

  it("user submits proposal 0 and agent does store it", async () => {
    const txEvent = createProposalCreatedTx(
      proposalIds[0],
      startBlocks[0],
      startBlocks[0],
      endBlocks[0]
    );

    await governanceStartVotingAgent.handleTransaction(txEvent);
  });

  it("voter decreases its voting power after voting end and returns 1 finding", async () => {
    mockGetNumberOfCheckpoints.mockReturnValue(
      new Promise((resolve) => resolve(1))
    );
    mockGetVoterPowerAtCheckpoint.mockReturnValue(
      new Promise((resolve) => resolve([1000, 200000]))
    );

    mockConfig.observationPeriodBeforeVoting = 5;
    mockConfig.observationPeriodAfterVoting = 5;
    mockConfig.votingPowerChangeThreshold = "1";

    const voteCastTx = createVoteCastTx(
      proposalIds[0],
      voters[0],
      votes[0],
      voteTypes[0],
      15
    );

    await governanceCastVoteAgent.handleTransaction(
      voteCastTx,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    const txEvent = createDelegateVotesChangedTx(voters[0], 100, 50, 24);

    const findings = await handleTransaction(txEvent, mockConfig);

    const expectedFinding = buildFindingResult2(
      proposalIds[0].toString(),
      voters[0],
      votes[0].toString(),
      voteTypes[0].toString(),
      "15",
      mockConfig.observationPeriodAfterVoting,
      mockConfig.votingPowerChangeThreshold
    );
    expect(findings).toStrictEqual([expectedFinding]);
  });

  it("influencing voter decreases its voting power after voting end and returns 1 finding", async () => {
    mockConfig.observationPeriodBeforeVoting = 10;
    mockConfig.observationPeriodAfterVoting = 5;
    mockConfig.votingPowerChangeThreshold = "1";

    mockGetNumberOfCheckpoints.mockReturnValue(
      new Promise((resolve) => resolve(2))
    );
    mockGetVoterPowerAtCheckpoint
      .mockReturnValueOnce(
        new Promise((resolve) => resolve([5, BigNumber.from(100)]))
      )
      .mockReturnValueOnce(
        new Promise((resolve) => resolve([2, BigNumber.from(50)]))
      );

    const voteCastTx = createVoteCastTx(
      proposalIds[0],
      voters[1],
      votes[0],
      voteTypes[0],
      15
    );

    await governanceCastVoteAgent.handleTransaction(
      voteCastTx,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    const txEvent = createDelegateVotesChangedTx(voters[1], 100, 50, 24);

    const findings = await handleTransaction(txEvent, mockConfig);

    const expectedFinding = buildFindingResult3(
      proposalIds[0].toString(),
      voters[1],
      votes[0].toString(),
      voteTypes[0].toString(),
      "15",
      mockConfig.observationPeriodBeforeVoting,
      mockConfig.observationPeriodAfterVoting,
      mockConfig.votingPowerChangeThreshold
    );
    expect(findings).toStrictEqual([expectedFinding]);
  });

  it("user submits proposal 1 and agent does store it", async () => {
    const txEvent = createProposalCreatedTx(
      proposalIds[1],
      startBlocks[1],
      startBlocks[1],
      endBlocks[1]
    );

    await governanceStartVotingAgent.handleTransaction(txEvent);
  });

  it("voter decreases its voting power after voting end but outside the observation period, so returns 0 findings", async () => {
    mockGetNumberOfCheckpoints.mockReturnValue(
      new Promise((resolve) => resolve(1))
    );
    mockGetVoterPowerAtCheckpoint.mockReturnValue(
      new Promise((resolve) => resolve([1000, 200000]))
    );

    mockConfig.observationPeriodBeforeVoting = 5;
    mockConfig.observationPeriodAfterVoting = 4;
    mockConfig.votingPowerChangeThreshold = "1";

    const voteCastTx = createVoteCastTx(
      proposalIds[1],
      voters[0],
      votes[0],
      voteTypes[0],
      150
    );

    await governanceCastVoteAgent.handleTransaction(
      voteCastTx,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    const txEvent = createDelegateVotesChangedTx(voters[0], 100, 50, 240);

    const findings = await handleTransaction(txEvent, mockConfig);

    expect(findings).toStrictEqual([]);
  });

  it("voter decreases its voting power after voting end inside the observation period but not enough change, so returns 0 findings", async () => {
    mockGetNumberOfCheckpoints.mockReturnValue(
      new Promise((resolve) => resolve(1))
    );
    mockGetVoterPowerAtCheckpoint.mockReturnValue(
      new Promise((resolve) => resolve([1000, 200000]))
    );

    mockConfig.observationPeriodBeforeVoting = 5;
    mockConfig.observationPeriodAfterVoting = 5;
    mockConfig.votingPowerChangeThreshold = "50";

    const voteCastTx = createVoteCastTx(
      proposalIds[1],
      voters[1],
      votes[0],
      voteTypes[0],
      150
    );

    await governanceCastVoteAgent.handleTransaction(
      voteCastTx,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    const txEvent = createDelegateVotesChangedTx(voters[1], 100, 50, 240);

    const findings = await handleTransaction(txEvent, mockConfig);

    expect(findings).toStrictEqual([]);
  });

  it("influencing voter decreases its voting power after voting end but outside the observation period, so returns 0 findings", async () => {
    mockConfig.observationPeriodBeforeVoting = 10;
    mockConfig.observationPeriodAfterVoting = 4;
    mockConfig.votingPowerChangeThreshold = "1";

    mockGetNumberOfCheckpoints.mockReturnValue(
      new Promise((resolve) => resolve(2))
    );
    mockGetVoterPowerAtCheckpoint
      .mockReturnValueOnce(
        new Promise((resolve) => resolve([5, BigNumber.from(100)]))
      )
      .mockReturnValueOnce(
        new Promise((resolve) => resolve([2, BigNumber.from(50)]))
      );

    const voteCastTx = createVoteCastTx(
      proposalIds[1],
      voters[2],
      votes[0],
      voteTypes[0],
      150
    );

    await governanceCastVoteAgent.handleTransaction(
      voteCastTx,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    const txEvent = createDelegateVotesChangedTx(voters[2], 100, 50, 240);

    const findings = await handleTransaction(txEvent, mockConfig);

    expect(findings).toStrictEqual([]);
  });

  it("influencing voter decreases its voting power after voting end but inside the observation period but not enough change, so returns 0 findings", async () => {
    mockConfig.observationPeriodBeforeVoting = 10;
    mockConfig.observationPeriodAfterVoting = 4;
    mockConfig.votingPowerChangeThreshold = "50";

    mockGetNumberOfCheckpoints.mockReturnValue(
      new Promise((resolve) => resolve(2))
    );
    mockGetVoterPowerAtCheckpoint
      .mockReturnValueOnce(
        new Promise((resolve) => resolve([5, BigNumber.from(100)]))
      )
      .mockReturnValueOnce(
        new Promise((resolve) => resolve([2, BigNumber.from(50)]))
      );

    const voteCastTx = createVoteCastTx(
      proposalIds[1],
      voters[3],
      votes[0],
      voteTypes[0],
      150
    );

    await governanceCastVoteAgent.handleTransaction(
      voteCastTx,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    const txEvent = createDelegateVotesChangedTx(voters[3], 100, 50, 240);

    const findings = await handleTransaction(txEvent, mockConfig);

    expect(findings).toStrictEqual([]);
  });
});
