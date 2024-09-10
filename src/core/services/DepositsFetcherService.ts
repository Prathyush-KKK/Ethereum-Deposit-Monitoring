import { Deposit } from "core/domain/deposit";
import { IDepositsRepository } from "core/types.repositories";
import {
  GetDepositsProps,
  DepositsFetcherService as IDepositsFetcherService,
} from "core/types.services";

// DONE - Storing last block is done in the DepositsTrackerService

// NOTE - error handling for fetches to data gateways is missing and it's relative to business logics needs
// DONE - Error handling in data fetches handled in DepositsTrackerService

export class DepositsFetcherService implements IDepositsFetcherService {
  private depositsRepository: IDepositsRepository;

  constructor(options: { depositsRepository: IDepositsRepository }) {
    this.depositsRepository = options.depositsRepository;
  }

  public async getDeposits(props: GetDepositsProps): Promise<Deposit[]> {
    try {
      return await this.depositsRepository.getDeposits(props);
    } catch (error: any) {
      console.error('Error fetching deposits:', error);
      throw new Error('Failed to fetch deposits');
    }
  }
}
