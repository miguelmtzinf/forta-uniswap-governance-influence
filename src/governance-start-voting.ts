import { TransactionEvent } from "forta-agent";
import {
  GOVERNOR_BRAVO_CONTRACT_ADDRESS,
  GOVERNOR_BRAVO_PROPOSAL_CREATED_EVENT,
} from "./constants";
import { initProposal } from "./store-repository";

async function handleTransaction(txEvent: TransactionEvent) {
  // find events of proposal creations
  const proposalCreatedEvents = txEvent.filterLog(
    GOVERNOR_BRAVO_PROPOSAL_CREATED_EVENT,
    GOVERNOR_BRAVO_CONTRACT_ADDRESS
  );
  // Store proposal info
  for (const proposalEvent of proposalCreatedEvents) {
    let { id, startBlock, endBlock } = proposalEvent.args;
    initProposal(id, startBlock.toString(), endBlock.toString());
  }
}

export default {
  handleTransaction,
};
