# Forta Agent to detect Influence in Uniswap Governance Proposals

## Description

Web3 protocols are usually governed in a decentralized manner, where token holders (as a community) decide the future of the protocol through a sophisticated process of proposals and votes. The more tokens a user has, the more voting power. In addition, users can delegate their power to others to act in their will, thus, having the voting power as a combination of token balance and delegated power.

Since large token holders have a great impact in proposal outcomes, would be possible to influence the proposal voting following this strategy: i) gather a huge amount of voting power before the beginning of the voting, ii) vote with the achieved voting power and iii) give back the voting power. Since this could be legit, it undermines the purpose of the governance proposal.

This agent detects influencing voters in proposals of [Uniswap Governance](https://app.uniswap.org/#/vote). A voter could be considered as **influencing** if its voting power gets increased or decreased, before and after the voting period, more than a given threshold.

The agent uses three parameters as configuration to identify influencing users:

- OBSERVATION_PERIOD_BEFORE_VOTING: It is the period duration (in blocks) of observation of voting power increases before the voting beginning (180000 blocks by default, which is around 1 month).
- OBSERVATION_PERIOD_AFTER_VOTING: It is the period duration (in blocks) of observation of voting power decreases after the voting end (180000 blocks by default, which is around 1 month).
- VOTING_POWER_CHANGE_THRESHOLD: It is the threshold (in wei) to consider a voting power change as part of an influencing strategy (10k UNI by default).

Therefore, the agent will trigger an alert if it detects three kind of scenarios:

- User vote a proposal, and its voting power was increased more than `VOTING_POWER_CHANGE_THRESHOLD` in the previous `OBSERVATION_PERIOD_BEFORE_VOTING` blocks before the proposal beginning.
- User vote a proposal, and its voting power gets decreased more than `VOTING_POWER_CHANGE_THRESHOLD` in the following `OBSERVATION_PERIOD_AFTER_VOTING` blocks to the proposal ending.
- User vote a proposal, and its voting power was increased more than `VOTING_POWER_CHANGE_THRESHOLD` in the previous `OBSERVATION_PERIOD_BEFORE_VOTING` blocks before the proposal beginning and also gets decreased more than `VOTING_POWER_CHANGE_THRESHOLD` in the following `OBSERVATION_PERIOD_AFTER_VOTING` blocks to the proposal ending.

You can find the configuration file of these parameters [here](src/config.ts),

Note that although this agent is designed for Uniswap Governance, would be way easy to adjust for other governance protocols powered by [Governor Bravo](https://compound.finance/docs/governance#governor-bravo). Updating the `GOVERNOR_BRAVO_CONTRACT_ADDRESS` parameter [here](src/constants.ts) would allow us to target a different GovernorBravo-based governance contract.

## Supported Chains

- Ethereum
- List any other chains this agent can support e.g. BSC

## Alerts

Describe each of the type of alerts fired by this agent

- GOVERNANCE-ALERT-1

  - Fired when a influencing voter has been detected: its voting power was increased more than _10k UNI_ in the previous _1 month_ before the voting beginning.
  - Severity is always set to `low` since its a just regular voting power increase
  - Type is always set to `info`
  - Additional metadata fields:

    - `voter`: the address of the voter
    - `proposalId`: the identifier of the governance proposal
    - `votesCastToProposal`: the amount of votes cast to the proposal voting
    - `voteType`: `against`, `for` or `abstain`
    - `voteCastAtBlock`: the block number the vote cast was made at

- GOVERNANCE-ALERT-2

  - Fired when a influencing voter has been detected: its voting power was decreased more than _10k UNI_ in the following _1 month_ after the voting end.
  - Severity is always set to `medium` since its a just regular voting power decrease
  - Type is always set to `info`
  - Additional metadata fields:

    - `voter`: the address of the voter
    - `proposalId`: the identifier of the governance proposal
    - `votesCastToProposal`: the amount of votes cast to the proposal voting
    - `voteType`: `against`, `for` or `abstain`
    - `voteCastAtBlock`: the block number the vote cast was made at

- GOVERNANCE-ALERT-3

  - Fired when a influencing voter has been detected: its voting power was increased more than _10k UNI_ in the previous _1 month_ before the voting beginning and decreased more than _10k UNI_ in the following _1 month_ after the voting end.
  - Severity is always set to `high` since its a clear signal of the action of an influencing voter
  - Type is always set to `info`
  - Additional metadata fields:

    - `voter`: the address of the voter
    - `proposalId`: the identifier of the governance proposal
    - `votesCastToProposal`: the amount of votes cast to the proposal voting
    - `voteType`: `against`, `for` or `abstain`
    - `voteCastAtBlock`: the block number the vote cast was made at

## Alert Samples

- The address `0x0000000000000000000000000000000000010002` cast a vote _against_ the proposal _10000001_ at block _#15_ with a voting power of _100_. This address increased its voting power more than _10_ units in the previous _10 blocks_ before the voting started.

```JSON
{
  "name": "Influencing Voter in Governance Proposal",
  "description": "New vote cast to proposal #10000001 by an user who suffered an increase of voting power greater than 10 in the previous 10 blocks before the proposal submission.",
  "alertId": "GOVERNANCE-ALERT-1",
  "protocol": "uniswap",
  "severity": "Low",
  "type": "Info",
  "metadata": {
    "voter": "0x0000000000000000000000000000000000010002",
    "proposalId": "10000001",
    "votesCastToProposal": "100",
    "voteType": "against",
    "voteCastAtBlock": "15"
  }
}
```

- The address `0x0000000000000000000000000000000000010001` cast a vote _for_ the proposal _10000001_ at block _#15_ with a voting power of _100_. This address decreased its voting power more than _1_ unit in the following _5 blocks_ after the voting end.

```JSON
{
  "name": "Influencing Voter in Governance Proposal",
  "description": "Voter of proposal #10000001 suffered a decrease of voting power greater than 1 in the following 5 blocks after the voting end.",
  "alertId": "GOVERNANCE-ALERT-2",
  "protocol": "uniswap",
  "severity": "Medium",
  "type": "Info",
  "metadata": {
    "voter": "0x0000000000000000000000000000000000010001",
    "proposalId": "10000001",
    "votesCastToProposal": "100",
    "voteType": "for",
    "voteCastAtBlock": "15"
  }
}
```

- The address `0x0000000000000000000000000000000000010002` cast a vote _against_ the proposal _10000001_ at block _#15_ with a voting power of _100_. This address increased its voting power before the voting start more than _1_ unit in the previous _10 blocks_ and decreased its voting power more than _1_ unit in the following _5 blocks_ after the voting end.

```JSON
{
  "name": "Influencing Voter in Governance Proposal",
  "description": "Proposal has been influenced. Voter of proposal #10000001 suffered an increase of voting power greater than 1 in the previous 10 blocks before the voting start and a decrease of voting power greater than 1 in the following 5 blocks after the voting end.",
  "alertId": "GOVERNANCE-ALERT-3",
  "protocol": "uniswap",
  "severity": "High",
  "type": "Info",
  "metadata":{
    "voter": "0x0000000000000000000000000000000000010002",
    "proposalId": "10000001",
    "votesCastToProposal": "100",
    "voteType": "against",
    "voteCastAtBlock": "15"
  }
}

```
