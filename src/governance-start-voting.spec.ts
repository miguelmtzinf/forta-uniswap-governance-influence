import { createAddress, TestTransactionEvent } from "forta-agent-tools";
import {
  GOVERNOR_BRAVO_CONTRACT_ADDRESS,
  GOVERNOR_BRAVO_PROPOSAL_CREATED_EVENT,
} from "../src/constants";
import { createLog, createProposalCreatedTx } from "./helpers";

import governanceStartVotingAgent from "../src/governance-start-voting";
import { exist, get } from "../src/store-repository";

describe("governance proposal start voting", () => {
  let handleTransaction: any;

  const proposalIds = [10000001, 10000002, 10000003, 10000004];
  const startBlocks = [1000000000, 100000003, 400000000, 400000002];
  const endBlocks = [200000000, 200000003, 500000000, 500000002];
  const blockNumbers = [12301, 12302, 30000, 30001, 60000];

  beforeAll(() => {
    handleTransaction = governanceStartVotingAgent.handleTransaction;
  });

  it("does not store any proposal since there are no proposal creations", async () => {
    const basicTxEvent = new TestTransactionEvent();

    await handleTransaction(basicTxEvent);

    expect(exist(proposalIds[0].toString())).toBeFalsy;
  });

  it("user submits proposal 0 and agent does store it", async () => {
    const txEvent = createProposalCreatedTx(
      proposalIds[0],
      blockNumbers[0],
      startBlocks[0],
      endBlocks[0]
    );

    await handleTransaction(txEvent);

    expect(exist(proposalIds[0].toString())).toBeTruthy;
    const proposal = get(proposalIds[0].toString());
    expect(proposal?.startBlock).toBe(startBlocks[0].toString());
    expect(proposal?.endBlock).toBe(endBlocks[0].toString());
    expect(proposal?.votes).toStrictEqual({});
  });

  it("user submits proposal 1 and 2 in same tx and agent does store them", async () => {
    const txEvent = new TestTransactionEvent();
    const dataRaw1 = [
      proposalIds[1],
      createAddress("0xdEaD"),
      [],
      [],
      [],
      [],
      startBlocks[1].toString(),
      endBlocks[1].toString(),
      "description",
    ];
    const dataRaw2 = [
      proposalIds[2],
      createAddress("0xdEaD"),
      [],
      [],
      [],
      [],
      startBlocks[2].toString(),
      endBlocks[2].toString(),
      "description",
    ];
    txEvent.receipt.logs.push(
      createLog(
        GOVERNOR_BRAVO_PROPOSAL_CREATED_EVENT,
        GOVERNOR_BRAVO_CONTRACT_ADDRESS,
        dataRaw1
      ) as any
    );
    txEvent.receipt.logs.push(
      createLog(
        GOVERNOR_BRAVO_PROPOSAL_CREATED_EVENT,
        GOVERNOR_BRAVO_CONTRACT_ADDRESS,
        dataRaw2
      ) as any
    );
    txEvent.setTo(GOVERNOR_BRAVO_CONTRACT_ADDRESS);
    txEvent.setBlock(blockNumbers[0]);

    await handleTransaction(txEvent);

    expect(exist(proposalIds[1].toString())).toBeTruthy;
    expect(exist(proposalIds[2].toString())).toBeTruthy;
    const proposal1 = get(proposalIds[1].toString());
    expect(proposal1?.startBlock).toBe(startBlocks[1].toString());
    expect(proposal1?.endBlock).toBe(endBlocks[1].toString());
    expect(proposal1?.votes).toStrictEqual({});
    const proposal2 = get(proposalIds[2].toString());
    expect(proposal2?.startBlock).toBe(startBlocks[2].toString());
    expect(proposal2?.endBlock).toBe(endBlocks[2].toString());
    expect(proposal2?.votes).toStrictEqual({});
  });
});
