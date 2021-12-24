import { createAddress, TestTransactionEvent } from "forta-agent-tools";
import { BigNumber } from "ethers";
import {
  buildFindingResult1,
  createProposalCreatedTx,
  createVoteCastTx,
} from "./helpers";

import governanceStartVotingAgent from "../src/governance-start-voting";
import governanceCastVoteAgent from "../src/governance-cast-vote";

describe("governance proposal cast vote", () => {
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
  ];
  const voteTypes = [0, 1, 2]; // ["against", "for", "abstain"];
  const startBlocks = [10];
  const endBlocks = [20];
  const votes = [100, 200, 300, 400];

  beforeAll(() => {
    handleTransaction = governanceCastVoteAgent.handleTransaction;
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

  it("returns 0 findings since there are no vote cast events", async () => {
    const basicTxEvent = new TestTransactionEvent();

    const findings = await handleTransaction(
      basicTxEvent,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    expect(findings).toStrictEqual([]);
    expect(mockGetNumberOfCheckpoints).toHaveBeenCalledTimes(0);
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledTimes(0);
  });

  it("returns 0 findings since there is vote cast of a non-tracking proposal", async () => {
    const txEvent = createVoteCastTx(
      proposalIds[0],
      voters[0],
      votes[0],
      voteTypes[0],
      15
    );

    const findings = await handleTransaction(
      txEvent,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    expect(findings).toStrictEqual([]);
    expect(mockGetNumberOfCheckpoints).toHaveBeenCalledTimes(1);
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledTimes(0);
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

  it("user submits a vote with no influenced voting power and returns 0 findings", async () => {
    mockGetNumberOfCheckpoints.mockReturnValue(
      new Promise((resolve) => resolve(1))
    );
    mockGetVoterPowerAtCheckpoint.mockReturnValue(
      new Promise((resolve) => resolve([1000, 200000]))
    );

    mockConfig.observationPeriodBeforeVoting = 5;
    mockConfig.votingPowerChangeThreshold = "1";

    const txEvent = createVoteCastTx(
      proposalIds[0],
      voters[0],
      votes[0],
      voteTypes[0],
      15
    );

    const findings = await handleTransaction(
      txEvent,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    expect(findings).toStrictEqual([]);
    expect(mockGetNumberOfCheckpoints).toHaveBeenCalledTimes(1);
    expect(mockGetNumberOfCheckpoints).toHaveBeenCalledWith(voters[0]);
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledTimes(1);
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledWith(voters[0], "0");
  });

  it("user submits a vote with influenced voting power and returns 1 finding", async () => {
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

    mockConfig.observationPeriodBeforeVoting = 10;
    mockConfig.votingPowerChangeThreshold = "10";

    const txEvent = createVoteCastTx(
      proposalIds[0],
      voters[1],
      votes[0],
      voteTypes[0],
      15
    );

    const findings = await handleTransaction(
      txEvent,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    const expectedFinding = buildFindingResult1(
      proposalIds[0].toString(),
      voters[1],
      votes[0].toString(),
      voteTypes[0].toString(),
      "15",
      mockConfig.observationPeriodBeforeVoting,
      mockConfig.votingPowerChangeThreshold
    );
    expect(findings).toStrictEqual([expectedFinding]);

    expect(mockGetNumberOfCheckpoints).toHaveBeenCalledTimes(1);
    expect(mockGetNumberOfCheckpoints).toHaveBeenCalledWith(voters[1]);
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledTimes(2);
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledWith(voters[1], "1");
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledWith(voters[1], "0");
  });

  it("user submits a vote with influenced voting power but outside of observation period, so returns 0 findings", async () => {
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

    mockConfig.observationPeriodBeforeVoting = 2;
    mockConfig.votingPowerChangeThreshold = "10";

    const txEvent = createVoteCastTx(
      proposalIds[0],
      voters[2],
      votes[0],
      voteTypes[0],
      15
    );

    const findings = await handleTransaction(
      txEvent,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    expect(findings).toStrictEqual([]);
    expect(mockGetNumberOfCheckpoints).toHaveBeenCalledTimes(1);
    expect(mockGetNumberOfCheckpoints).toHaveBeenCalledWith(voters[2]);
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledTimes(1);
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledWith(voters[2], "1");
  });

  it("user submits a vote inside the observation period but not enough influenced voting power and returns 0 finding", async () => {
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

    mockConfig.observationPeriodBeforeVoting = 10;
    mockConfig.votingPowerChangeThreshold = "50";

    const txEvent = createVoteCastTx(
      proposalIds[0],
      voters[1],
      votes[0],
      voteTypes[0],
      15
    );

    const findings = await handleTransaction(
      txEvent,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );

    expect(findings).toStrictEqual([]);

    expect(mockGetNumberOfCheckpoints).toHaveBeenCalledTimes(1);
    expect(mockGetNumberOfCheckpoints).toHaveBeenCalledWith(voters[1]);
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledTimes(2);
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledWith(voters[1], "1");
    expect(mockGetVoterPowerAtCheckpoint).toHaveBeenCalledWith(voters[1], "0");
  });
});
