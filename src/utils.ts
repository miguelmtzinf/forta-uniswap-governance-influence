import { ethers, getEthersProvider } from "forta-agent";
import { BigNumber } from "ethers";
import {
  UNI_CONTRACT_ADDRESS,
  UNI_GET_CHECKPOINTS_COUNT_FUNCTION,
  UNI_GET_CHECKPOINT_FUNCTION,
} from "./constants";

export const getVoterPowerAtCheckpoint = async (
  address: string,
  index: string
): Promise<[number, BigNumber]> => {
  const iface = new ethers.utils.Interface([UNI_GET_CHECKPOINT_FUNCTION]);
  const uniContract = new ethers.Contract(
    UNI_CONTRACT_ADDRESS,
    iface,
    getEthersProvider()
  );
  const [fromBlock, votes] = await uniContract.checkpoints(address, index);
  return [fromBlock, votes];
};

export const getNumberOfCheckpoints = async (address: string) => {
  const iface = new ethers.utils.Interface([
    UNI_GET_CHECKPOINTS_COUNT_FUNCTION,
  ]);
  const uniContract = new ethers.Contract(
    UNI_CONTRACT_ADDRESS,
    iface,
    getEthersProvider()
  );
  const numCheckpoints = (await uniContract.numCheckpoints(address)) as number;
  return numCheckpoints;
};
