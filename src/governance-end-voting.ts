import {
  Finding,
  FindingSeverity,
  FindingType,
  TransactionEvent,
} from "forta-agent";
import {
  UNI_CONTRACT_ADDRESS,
  UNI_DELEGATE_VOTES_CHANGES_EVENT,
} from "./constants";
import { BigNumber } from "ethers";
import {
  getProposalIdsWithEndBlockGreaterThan,
  getVoters,
  setBalanceDecreaseAfterProposal,
  getBalanceDecreaseAfterProposal,
  getBalanceIncreaseBeforeProposal,
  get,
  getVoteCast,
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

async function handleTransaction(
  txEvent: TransactionEvent,
  config: {
    observationPeriodBeforeVoting: number;
    observationPeriodAfterVoting: number;
    votingPowerChangeThreshold: string;
  }
) {
  const findings: Finding[] = [];
  // if no events found for delegateVotes changed, return
  const delegateVotesChangedEvents = txEvent.filterLog(
    UNI_DELEGATE_VOTES_CHANGES_EVENT,
    UNI_CONTRACT_ADDRESS
  );
  if (!delegateVotesChangedEvents.length) return findings;

  // Fetch proposals inside the observation period
  const currentBlockNumber = txEvent.blockNumber;
  const proposals = getProposalIdsWithEndBlockGreaterThan(
    currentBlockNumber - config.observationPeriodAfterVoting
  );
  if (proposals.length == 0) return findings;

  // Iterate over the observed proposals
  for (let i = 0; i < proposals.length; i++) {
    const proposalId = proposals[i];
    const voters = getVoters(proposalId);

    for (const delegateVotesChangedEvent of delegateVotesChangedEvents) {
      const { delegate, previousBalance, newBalance } =
        delegateVotesChangedEvent.args;

      // Check if the user which votes has changed is part of the voting
      const index = voters.findIndex(
        (address) => address.toLowerCase() === delegate.toLowerCase()
      );
      if (index == -1) {
        continue;
      }

      let balanceDecrease = previousBalance.sub(newBalance);
      if (balanceDecrease.gt(0)) {
        // If voter balance was already decreased, update amount
        const [isAlreadyDecreased, amountAlreadyDecreased] =
          getBalanceDecreaseAfterProposal(proposalId, delegate);
        if (isAlreadyDecreased) {
          balanceDecrease = BigNumber.from(amountAlreadyDecreased).add(
            balanceDecrease
          );
        }

        // Store balance decrease
        setBalanceDecreaseAfterProposal(
          proposalId,
          delegate,
          balanceDecrease.toString()
        );

        // Check if the balance gets decreased more than the threshold
        if (
          balanceDecrease.gt(BigNumber.from(config.votingPowerChangeThreshold))
        ) {
          // Check whether the user is already an influencing voter
          const [wasBalanceIncreased] = getBalanceIncreaseBeforeProposal(
            proposalId,
            delegate
          );

          if (wasBalanceIncreased) {
            findings.push(
              Finding.fromObject({
                name: "Influencing Voter in Governance Proposal",
                description:
                  `Proposal has been influenced. Voter of proposal #${proposalId} suffered an increase of voting power greater ` +
                  `than ${config.votingPowerChangeThreshold} in the previous ${config.observationPeriodBeforeVoting} blocks before the voting start ` +
                  `and a decrease of voting power greater than ${config.votingPowerChangeThreshold} in the following ${config.observationPeriodAfterVoting} ` +
                  `blocks after the voting end.`,
                alertId: "GOVERNANCE-ALERT-3",
                protocol: "uniswap",
                severity: FindingSeverity.High,
                type: FindingType.Info,
                metadata: buildMetadata(proposalId, delegate),
              })
            );
          } else {
            findings.push(
              Finding.fromObject({
                name: "Influencing Voter in Governance Proposal",
                description:
                  `Voter of proposal #${proposalId} suffered a decrease of voting power greater ` +
                  `than ${config.votingPowerChangeThreshold} in the following ${config.observationPeriodAfterVoting} blocks after the voting end.`,
                alertId: "GOVERNANCE-ALERT-2",
                protocol: "uniswap",
                severity: FindingSeverity.Medium,
                type: FindingType.Info,
                metadata: buildMetadata(proposalId, delegate),
              })
            );
          }
        }
      }
    }
  }

  return findings;
}

export default {
  handleTransaction,
};
