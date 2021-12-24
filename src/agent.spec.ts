import agent from "./agent";

describe("Influencing Governance Proposal Agent", () => {
  let handleTransaction: any;

  const mockGovernanceStartVoting = {
    handleTransaction: jest.fn(),
  };
  const mockGovernanceCastVote = {
    handleTransaction: jest.fn(),
  };
  const mockGovernanceEndVoting = {
    handleTransaction: jest.fn(),
  };
  const mockTxEvent = {
    some: "event",
  };

  const mockGetNumberOfCheckpoints = jest.fn();
  const mockGetVoterPowerAtCheckpoint = jest.fn();
  const mockConfig = {
    observationPeriodBeforeVoting: 100,
    observationPeriodAfterVoting: 100,
    votingPowerChangeThreshold: "10000",
  };

  beforeAll(() => {
    handleTransaction = agent.provideHandleTransaction(
      mockGovernanceStartVoting.handleTransaction,
      mockGovernanceCastVote.handleTransaction,
      mockGovernanceEndVoting.handleTransaction,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );
  });

  it("calls governanceStartVoting, governanceCastVote and governanceEndVoting and returns its findings", async () => {
    const mockFinding1 = { some: "finding1" };
    const mockFinding2 = { some: "finding2" };
    mockGovernanceCastVote.handleTransaction.mockReturnValueOnce([
      mockFinding1,
    ]);
    mockGovernanceEndVoting.handleTransaction.mockReturnValueOnce([
      mockFinding2,
    ]);

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([mockFinding1, mockFinding2]);
    expect(mockGovernanceStartVoting.handleTransaction).toHaveBeenCalledTimes(
      1
    );
    expect(mockGovernanceStartVoting.handleTransaction).toHaveBeenCalledWith(
      mockTxEvent
    );
    expect(mockGovernanceCastVote.handleTransaction).toHaveBeenCalledTimes(1);
    expect(mockGovernanceCastVote.handleTransaction).toHaveBeenCalledWith(
      mockTxEvent,
      mockGetNumberOfCheckpoints,
      mockGetVoterPowerAtCheckpoint,
      mockConfig
    );
    expect(mockGovernanceEndVoting.handleTransaction).toHaveBeenCalledTimes(1);
    expect(mockGovernanceEndVoting.handleTransaction).toHaveBeenCalledWith(
      mockTxEvent,
      mockConfig
    );
  });
});
