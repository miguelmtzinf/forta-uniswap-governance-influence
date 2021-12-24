type VoteType = {
  [voter: string]: {
    votes: string;
    support: string; // against, for, abstain
    blockNumber: number;
    isBalanceIncreaseBeforeProposal: boolean;
    balanceIncreaseBeforeProposal: string;
    isBalanceDecreaseAfterProposal: boolean;
    balanceDecreaseAfterProposal: string;
  };
};
type Store = {
  [id: string]: {
    startBlock: string;
    endBlock: string;
    votes: VoteType;
  };
};

const store: Store = {};

export const exist = (id: string) => {
  return !!store[id];
};

export const get = (id: string) => {
  if (!store[id]) return undefined;
  return store[id];
};

export const getStartBlock = (id: string) => {
  if (!exist(id)) return "0";
  return store[id].startBlock;
};

export const getEndBlock = (id: string) => {
  if (!exist(id)) return "0";
  return store[id].endBlock;
};

export const getProposalIdsWithEndBlockGreaterThan = (blockNumber: number) => {
  const reducer = (acc: any, item: any, index: any) => {
    if (Number.parseInt(item.endBlock) > blockNumber) {
      return [...acc, Object.keys(store)[index]];
    }
    return acc;
  };
  return Object.values(store).reduce(reducer, []);
};

export const getVoters = (id: string) => {
  if (!exist(id) || !store[id].votes) return [];
  return Object.keys(store[id].votes);
};

export const getVoteCast = (id: string, voter: string) => {
  if (!exist(id) || !store[id].votes || !store[id].votes[voter])
    return undefined;
  return store[id].votes[voter];
};

export const initProposal = (
  id: string,
  startBlock: string,
  endBlock: string
) => {
  store[id] = {
    startBlock,
    endBlock,
    votes: {},
  };
};

export const addVote = (
  id: string,
  voter: string,
  votes: string,
  support: string,
  blockNumber: number
) => {
  store[id].votes[voter] = {
    votes,
    support,
    blockNumber,
    balanceIncreaseBeforeProposal: "",
    isBalanceIncreaseBeforeProposal: false,
    balanceDecreaseAfterProposal: "",
    isBalanceDecreaseAfterProposal: false,
  };
};

export const getBalanceIncreaseBeforeProposal = (id: string, voter: string) => {
  return [
    store[id].votes[voter].isBalanceIncreaseBeforeProposal,
    store[id].votes[voter].balanceIncreaseBeforeProposal,
  ];
};

export const setBalanceIncreaseBeforeProposal = (
  id: string,
  voter: string,
  amount: string
) => {
  store[id].votes[voter].balanceIncreaseBeforeProposal = amount;
  store[id].votes[voter].isBalanceIncreaseBeforeProposal = true;
};

export const getBalanceDecreaseAfterProposal = (id: string, voter: string) => {
  return [
    store[id].votes[voter].isBalanceDecreaseAfterProposal,
    store[id].votes[voter].balanceDecreaseAfterProposal,
  ];
};

export const setBalanceDecreaseAfterProposal = (
  id: string,
  voter: string,
  amount: string
) => {
  store[id].votes[voter].balanceDecreaseAfterProposal = amount;
  store[id].votes[voter].isBalanceDecreaseAfterProposal = true;
};
