import { Deposit } from "./domain/deposit";
import { GetDepositsProps } from "./types.services";

export interface IDepositsRepository {
  updateLastProcessedBlock: any;
  storeDeposit(deposit: Deposit): Promise<void>;
  getLatestStoredBlock(): Promise<number | null>;
  getDeposits(props: GetDepositsProps): Promise<Deposit[]>;
}
