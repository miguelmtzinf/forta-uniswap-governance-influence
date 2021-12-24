export const GOVERNOR_BRAVO_VOTE_CAST_EVENT =
  "event VoteCast(address indexed voter, uint proposalId, uint8 support, uint votes, string reason)";

export const GOVERNOR_BRAVO_PROPOSAL_CREATED_EVENT =
  "event ProposalCreated(uint id, address proposer, address[] targets, uint[] values, string[] signatures, bytes[] calldatas, uint startBlock, uint endBlock, string description)";

export const GOVERNOR_BRAVO_CONTRACT_ADDRESS =
  "0x408ed6354d4973f66138c91495f2f2fcbd8724c3";

export const UNI_GET_CHECKPOINT_FUNCTION =
  "function checkpoints(address account, uint32 index) external view returns (uint32, uint96)";

export const UNI_GET_CHECKPOINTS_COUNT_FUNCTION =
  "function numCheckpoints(address account) external view returns (uint32)";

export const UNI_DELEGATE_VOTES_CHANGES_EVENT =
  "event DelegateVotesChanged(address indexed delegate, uint previousBalance, uint newBalance)";

export const UNI_CONTRACT_ADDRESS =
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
