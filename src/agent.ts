import {
  ethers,
  Finding,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";
import { getNumberOfCheckpoints, getVoterPowerAtCheckpoint } from "./utils";
import {
  OBSERVATION_PERIOD_BEFORE_VOTING,
  OBSERVATION_PERIOD_AFTER_VOTING,
  VOTING_POWER_CHANGE_THRESHOLD,
} from "./config";

import governanceStartVoting from "./governance-start-voting";
import governanceCastVote from "./governance-cast-vote";
import governanceEndVoting from "./governance-end-voting";

export type GetNumberOfCheckpointsType = (address: string) => Promise<number>;
export type GetVoterPowerAtCheckpointType = (
  address: string,
  index: string
) => Promise<[number, ethers.BigNumber]>;

export type Config = {
  observationPeriodBeforeVoting: number;
  observationPeriodAfterVoting: number;
  votingPowerChangeThreshold: string;
};

export type GovernanceStartVotingHandleTransactionFunctionType = (
  txEvent: TransactionEvent
) => Promise<void>;

export type GovernanceCastVoteHandleTransactionFunctionType = (
  txEvent: TransactionEvent,
  getNumberOfCheckpoints: GetNumberOfCheckpointsType,
  getVoterPowerAtCheckpoint: GetVoterPowerAtCheckpointType,
  config: Config
) => Promise<Finding[]>;

export type GovernanceEndVotingHandleTransactionFunctionType = (
  txEvent: TransactionEvent,
  config: Config
) => Promise<Finding[]>;

function provideHandleTransaction(
  governanceStartVotingHandleTransaction: GovernanceStartVotingHandleTransactionFunctionType,
  governanceCastVoteHandleTransaction: GovernanceCastVoteHandleTransactionFunctionType,
  governanceEndVotingHandleTransaction: GovernanceEndVotingHandleTransactionFunctionType,
  getNumberOfCheckpoints: GetNumberOfCheckpointsType,
  getVoterPowerAtCheckpoint: GetVoterPowerAtCheckpointType,
  config: Config
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    // Handle creation of governance proposal
    await governanceStartVotingHandleTransaction(txEvent);

    // Handle casting of votes
    const findingsFromCastVote = await governanceCastVoteHandleTransaction(
      txEvent,
      getNumberOfCheckpoints,
      getVoterPowerAtCheckpoint,
      config
    );

    // Handle end of proposal voting
    const findingsFromEndBlock = await governanceEndVotingHandleTransaction(
      txEvent,
      config
    );

    return [findingsFromCastVote, findingsFromEndBlock].flat();
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(
    governanceStartVoting.handleTransaction,
    governanceCastVote.handleTransaction,
    governanceEndVoting.handleTransaction,
    getNumberOfCheckpoints,
    getVoterPowerAtCheckpoint,
    {
      observationPeriodBeforeVoting: OBSERVATION_PERIOD_BEFORE_VOTING,
      observationPeriodAfterVoting: OBSERVATION_PERIOD_AFTER_VOTING,
      votingPowerChangeThreshold: VOTING_POWER_CHANGE_THRESHOLD,
    }
  ),
};
