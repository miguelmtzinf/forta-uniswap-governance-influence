// //////////////////////////////////////////////////////////////////////////////////////
// Configuration variables to rise alerts of Influencing Voters in Governance Proposals
// //////////////////////////////////////////////////////////////////////////////////////

// Period duration (in blocks) of observation of voting power increases before the voting beginning
export const OBSERVATION_PERIOD_BEFORE_VOTING = 180000; // ~1 month

// Period duration (in blocks) of observation of voting power decreases after the voting end
export const OBSERVATION_PERIOD_AFTER_VOTING = 180000; // ~1 month

// Threshold (in wei) to consider a voting power change as part of an influencing strategy
// A value of 125000000000000000000 results in a voting power change of 125
export const VOTING_POWER_CHANGE_THRESHOLD = "10"; // 10k UNI
