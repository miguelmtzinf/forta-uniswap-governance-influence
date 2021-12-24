import {
  Finding,
  FindingSeverity,
  FindingType,
  TransactionEvent,
} from "forta-agent";
import {
  GOVERNOR_BRAVO_CONTRACT_ADDRESS,
  GOVERNOR_BRAVO_VOTE_CAST_EVENT,
} from "./constants";
import { BigNumber } from "ethers";
import {
  addVote,
  getStartBlock,
  setBalanceIncreaseBeforeProposal,
  getVoteCast,
  exist,
} from "./store-repository";

const buildMetadata = (proposalId: string, voter: string) => {
  const info = getVoteCast(proposalId, voter);
  return {
    voter: voter,
    proposalId: proposalId,
    votesCastToProposal: info?.votes || "",
    voteType: info?.support || "",
    voteCastAtBlock: info?.blockNumber.toString() || "",
  };
};

const getSupportResponse = (support: number) => {
  if (support === 0) {
    return "against";
  } else if (support === 1) {
    return "for";
  } else {
    return "abstain";
  }
};

const isInObservationPeriod = (
  startBlock: number,
  checkpointBlock: number,
  observationPeriodBeforeVoting: number
) => {
  const diff = startBlock - checkpointBlock;
  return BigNumber.from(diff).lt(BigNumber.from(observationPeriodBeforeVoting));
};

const votingPowerIncreased = (
  oldVotingPower: BigNumber,
  newVotingPower: BigNumber,
  votingPowerChangeThreshold: string
) => {
  return newVotingPower.sub(oldVotingPower).gt(BigNumber.from(votingPowerChangeThreshold));
};

async function handleTransaction(
  txEvent: TransactionEvent,
  getNumberOfCheckpoints: (address: string) => Promise<number>,
  getVoterPowerAtCheckpoint: (
    address: string,
    index: string
  ) => Promise<[number, BigNumber]>,
  config: {
    observationPeriodBeforeVoting: number;
    observationPeriodAfterVoting: number;
    votingPowerChangeThreshold: string;
  }
) {
  const findings: Finding[] = [];
  // if no events found for vote cast, return
  const voteCastEvents = txEvent.filterLog(
    GOVERNOR_BRAVO_VOTE_CAST_EVENT,
    GOVERNOR_BRAVO_CONTRACT_ADDRESS
  );
  if (!voteCastEvents.length) return findings;

  // fetch number of checkpoints of voters
  const reducer = (accumulator: any, element: any) => [
    ...accumulator,
    element.args.voter,
  ];
  const reducedVoteCastEvents = voteCastEvents.reduce(reducer, []);
  const promises = reducedVoteCastEvents.map((voter) =>
    getNumberOfCheckpoints(voter)
  );
  const voterCheckpoints = (await Promise.all(promises)) as number[];

  for (let i = 0; i < reducedVoteCastEvents.length; i++) {
    const { proposalId, voter, votes, support } = voteCastEvents[i].args;
    if (!exist(proposalId.toString()) || voterCheckpoints[i] == 0) continue;

    // Store vote info
    addVote(
      proposalId.toString(),
      voter,
      votes.toString(),
      getSupportResponse(support),
      txEvent.blockNumber
    );

    // Fetch last checkpoint
    const index = voterCheckpoints[i] - 1;
    const [finalCheckpoint, finalVotingPower] = await getVoterPowerAtCheckpoint(
      voter,
      index.toString()
    );
    const startBlock = Number.parseInt(getStartBlock(proposalId.toString()));

    // Check whether the last checkpoint is outside of the observation period
    if (
      !isInObservationPeriod(
        startBlock,
        finalCheckpoint,
        config.observationPeriodBeforeVoting
      )
    ) {
      continue;
    }

    // Check previous 100 blocks
    for (let i = index - 1; i >= 0; i--) {
      const [checkpointBlock, checkpointPower] =
        await getVoterPowerAtCheckpoint(voter, i.toString());

      if (
        votingPowerIncreased(
          checkpointPower,
          finalVotingPower,
          config.votingPowerChangeThreshold
        )
      ) {
        // Store balance increase
        setBalanceIncreaseBeforeProposal(
          proposalId.toString(),
          voter,
          finalVotingPower.sub(checkpointPower).toString()
        );

        findings.push(
          Finding.fromObject({
            name: "Influencing Voter in Governance Proposal",
            description:
              `New vote cast to proposal #${proposalId} by an user who suffered an increase of voting power greater ` +
              `than ${config.votingPowerChangeThreshold} in the previous ${config.observationPeriodBeforeVoting} blocks before the proposal submission.`,
            alertId: "GOVERNANCE-ALERT-1",
            protocol: "uniswap",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: buildMetadata(proposalId.toString(), voter),
          })
        );
        break;
      }

      // Stops iterate over checkpoints if they are outside the observation period
      if (
        !isInObservationPeriod(
          startBlock,
          checkpointBlock,
          config.observationPeriodBeforeVoting
        )
      ) {
        break;
      }
    }
  }

  return findings;
}

export default {
  handleTransaction,
};
