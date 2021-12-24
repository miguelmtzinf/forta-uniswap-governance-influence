import { ethers, Finding, FindingSeverity, FindingType } from "forta-agent";
import { createAddress, TestTransactionEvent } from "forta-agent-tools";
import {
  GOVERNOR_BRAVO_CONTRACT_ADDRESS,
  GOVERNOR_BRAVO_PROPOSAL_CREATED_EVENT,
  GOVERNOR_BRAVO_VOTE_CAST_EVENT,
  UNI_CONTRACT_ADDRESS,
  UNI_DELEGATE_VOTES_CHANGES_EVENT,
} from "../src/constants";

export const createLog = (abi: string, address: string, data: any) => {
  const iface = new ethers.utils.Interface([abi]);
  const fragment = Object.values(iface.events)[0];

  return {
    ...iface.encodeEventLog(fragment, data),
    address: address,
  };
};

export const createProposalCreatedTx = (
  proposalId: number,
  blockNumber: number,
  startBlock: number,
  endBlock: number
) => {
  const txEvent = new TestTransactionEvent();
  const dataRaw = [
    proposalId,
    createAddress("0xdEaD"),
    [],
    [],
    [],
    [],
    startBlock.toString(),
    endBlock.toString(),
    "description",
  ];
  txEvent.receipt.logs.push(
    createLog(
      GOVERNOR_BRAVO_PROPOSAL_CREATED_EVENT,
      GOVERNOR_BRAVO_CONTRACT_ADDRESS,
      dataRaw
    ) as any
  );
  txEvent.setTo(GOVERNOR_BRAVO_CONTRACT_ADDRESS);
  txEvent.setBlock(blockNumber);
  return txEvent;
};

export const createVoteCastTx = (
  proposalId: number,
  voter: string,
  votes: number,
  support: number,
  blockNumber: number
) => {
  const txEvent = new TestTransactionEvent();
  const dataRaw = [voter, proposalId.toString(), support, votes, "reason"];
  txEvent.receipt.logs.push(
    createLog(
      GOVERNOR_BRAVO_VOTE_CAST_EVENT,
      GOVERNOR_BRAVO_CONTRACT_ADDRESS,
      dataRaw
    ) as any
  );
  txEvent.setFrom(voter);
  txEvent.setTo(GOVERNOR_BRAVO_CONTRACT_ADDRESS);
  txEvent.setBlock(blockNumber);
  return txEvent;
};

export const createDelegateVotesChangedTx = (
  voter: string,
  previousBalance: number,
  newBalance: number,
  blockNumber: number
) => {
  const txEvent = new TestTransactionEvent();
  const dataRaw = [voter, previousBalance, newBalance];
  txEvent.receipt.logs.push(
    createLog(
      UNI_DELEGATE_VOTES_CHANGES_EVENT,
      UNI_CONTRACT_ADDRESS,
      dataRaw
    ) as any
  );
  txEvent.setFrom(voter);
  txEvent.setTo(UNI_CONTRACT_ADDRESS);
  txEvent.setBlock(blockNumber);
  return txEvent;
};

export const buildFindingResult1 = (
  proposalId: string,
  voter: string,
  votes: string,
  voteType: string,
  voteBlockNumber: string,
  observationPeriodBeforeVoting: number,
  votingPowerChangeThreshold: string
) => {
  let support = "abstain";
  if (voteType === "0") {
    support = "against";
  } else if (voteType === "1") {
    support = "for";
  }
  return Finding.fromObject({
    name: "Influencing Voter in Governance Proposal",
    description:
      `New vote cast to proposal #${proposalId} by an user who suffered an increase of voting power greater ` +
      `than ${votingPowerChangeThreshold} in the previous ${observationPeriodBeforeVoting} blocks before the proposal submission.`,
    alertId: `GOVERNANCE-ALERT-1`,
    protocol: "uniswap",
    severity: FindingSeverity.Low,
    type: FindingType.Info,
    metadata: {
      voter,
      proposalId,
      votesCastToProposal: votes,
      voteType: support,
      voteCastAtBlock: voteBlockNumber,
    },
  });
};

export const buildFindingResult2 = (
  proposalId: string,
  voter: string,
  votes: string,
  voteType: string,
  voteBlockNumber: string,
  observationPeriodAfterVoting: number,
  votingPowerChangeThreshold: string
) => {
  let support = "abstain";
  if (voteType === "0") {
    support = "against";
  } else if (voteType === "1") {
    support = "for";
  }
  return Finding.fromObject({
    name: "Influencing Voter in Governance Proposal",
    description:
      `Voter of proposal #${proposalId} suffered a decrease of voting power greater ` +
      `than ${votingPowerChangeThreshold} in the following ${observationPeriodAfterVoting} blocks after the voting end.`,
    alertId: `GOVERNANCE-ALERT-2`,
    protocol: "uniswap",
    severity: FindingSeverity.Medium,
    type: FindingType.Info,
    metadata: {
      voter,
      proposalId,
      votesCastToProposal: votes,
      voteType: support,
      voteCastAtBlock: voteBlockNumber,
    },
  });
};

export const buildFindingResult3 = (
  proposalId: string,
  voter: string,
  votes: string,
  voteType: string,
  voteBlockNumber: string,
  observationPeriodBeforeVoting: number,
  observationPeriodAfterVoting: number,
  votingPowerChangeThreshold: string
) => {
  let support = "abstain";
  if (voteType === "0") {
    support = "against";
  } else if (voteType === "1") {
    support = "for";
  }
  return Finding.fromObject({
    name: "Influencing Voter in Governance Proposal",
    description:
      `Proposal has been influenced. Voter of proposal #${proposalId} suffered an increase of voting power greater ` +
      `than ${votingPowerChangeThreshold} in the previous ${observationPeriodBeforeVoting} blocks before the voting start ` +
      `and a decrease of voting power greater than ${votingPowerChangeThreshold} in the following ${observationPeriodAfterVoting} ` +
      `blocks after the voting end.`,
    alertId: `GOVERNANCE-ALERT-3`,
    protocol: "uniswap",
    severity: FindingSeverity.High,
    type: FindingType.Info,
    metadata: {
      voter,
      proposalId,
      votesCastToProposal: votes,
      voteType: support,
      voteCastAtBlock: voteBlockNumber,
    },
  });
};
