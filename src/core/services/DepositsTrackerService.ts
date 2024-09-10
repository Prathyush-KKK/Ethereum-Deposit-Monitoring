import { Deposit, DepositSchema } from "core/domain/deposit";
import {
  IBlockchainGateway,
  INotifierGateway,
  TransactionData,
} from "core/types.gateways";
import { IDepositsRepository } from "core/types.repositories";
import { DepositsTrackerService as IDepositsTrackerService } from "core/types.services";

export class DepositsTrackerService implements IDepositsTrackerService {
  private blockchainGateway: IBlockchainGateway;
  private notificatorGateway: INotifierGateway | undefined;
  private depositsRepository: IDepositsRepository;
  private filterIn: string[];
  private lastProcessedBlock: number;

  constructor(options: {
    blockchainGateway: IBlockchainGateway;
    notificatorGateway?: INotifierGateway;
    depositsRepository: IDepositsRepository;
    filterIn: string[];
  }) {
    this.blockchainGateway = options.blockchainGateway;
    this.notificatorGateway = options.notificatorGateway;
    this.depositsRepository = options.depositsRepository;
    this.filterIn = options.filterIn;
    this.lastProcessedBlock = 0;

    if (this.filterIn.length) {
      console.info(
        `Filtering deposits for addresses: ${this.filterIn.join(", ")}`
      );
    }

    this.notificatorGateway?.sendNotification(`Deposits tracker service started`);
  }

  public async processBlockTransactions(
    blockNumberOrHash: string | number = "latest"
  ): Promise<void> {
    try {
      const transactions = await this.blockchainGateway.fetchBlockTransactions(
        blockNumberOrHash
      );

      const storeBatchSize = 5;
      if (transactions && transactions.length > 0) {
        const batches = Math.ceil(transactions.length / storeBatchSize);
        for (let i = 0; i < batches; i++) {
          const batch = transactions.slice(
            i * storeBatchSize,
            (i + 1) * storeBatchSize
          );
          for (const tx of batch) {
            await this.processTransaction(tx);
          }
        }

        if (typeof blockNumberOrHash === "number") {
          await this.updateLastProcessedBlock(blockNumberOrHash);
        }
      }
    } catch (error: any) {
      console.error(`Error processing block ${blockNumberOrHash}:`, error);
      await this.notificatorGateway?.sendNotification(
        `Error processing block: ${blockNumberOrHash}`
      );
    }
  }

  public async processBlockTransactionsFrom(blockNumber: number) {
    const lastStoredBlockNumber = await this.getLastProcessedBlock() || blockNumber;
    if (lastStoredBlockNumber) {
      console.info(
        `Executing block txs processing from block number ${lastStoredBlockNumber}`
      );
    }

    const latestBlock = await this.blockchainGateway.getBlockNumber();
    console.info(`Latest block number: ${latestBlock}`);

    for (let i = lastStoredBlockNumber; i <= latestBlock; i++) {
      await this.processBlockTransactions(i);
      await this.updateLastProcessedBlock(i);
    }

    console.info(
      `Finished processing blocks from ${lastStoredBlockNumber} to ${latestBlock}`
    );
  }

  public startPendingTransactionsListener(): void {
    this.blockchainGateway.watchPendingTransactions((tx: TransactionData) => {
      this.processTransaction(tx);
    });
  }

  public startMintedBlocksListener(): void {
    this.blockchainGateway.watchMintedBlocks((blockNumber: number) => {
      this.processBlockTransactions(blockNumber);
    });
  }

  private async processTransaction(txData: TransactionData): Promise<void> {
    try {
      if (!this.filterIn.includes(txData.to)) return;

      console.info("Found deposit transaction:", txData.hash);

      const fee = txData.gasLimit * txData.gasPrice;

      const deposit: Deposit = {
        blockNumber: txData.blockNumber,
        blockTimestamp: txData.blockTimestamp,
        pubkey: txData.from,
        fee: fee,
        hash: txData.hash,
        blockchain: this.blockchainGateway.blockchain,
        network: this.blockchainGateway.network,
        token: this.blockchainGateway.token,
      };

      DepositSchema.parse(deposit);

      await this.depositsRepository.storeDeposit(deposit);

      await this.notificatorGateway?.sendNotification(
        `Deposit processed: ${txData.hash}\n\nAmount: ${txData.value}\nFee: ${fee}\nFrom: ${txData.from}\nTo: ${txData.to}\nBlock: ${txData.blockNumber}`
      );
    } catch (error) {
      console.error(`Error processing deposit ${txData.hash}:`, error);
      await this.notificatorGateway?.sendNotification(
        `Error processing deposit: ${txData.hash}`
      );
    }
  }

  private async updateLastProcessedBlock(blockNumber: number): Promise<void> {
    this.lastProcessedBlock = blockNumber;
    if (typeof this.depositsRepository.updateLastProcessedBlock === 'function') {
      try {
        await this.depositsRepository.updateLastProcessedBlock(blockNumber);
      } catch (error) {
        console.warn('Failed to update last processed block in repository:', error);
      }
    }
    console.info(`Updated last processed block to ${blockNumber}`);
  }

  private async getLastProcessedBlock(): Promise<number> {
    if (typeof this.depositsRepository.getLatestStoredBlock === 'function') {
      try {
        const blockFromRepo = await this.depositsRepository.getLatestStoredBlock();
        if (blockFromRepo && blockFromRepo > this.lastProcessedBlock) {
          this.lastProcessedBlock = blockFromRepo;
        }
      } catch (error) {
        console.warn('Failed to get last processed block from repository:', error);
      }
    }
    return this.lastProcessedBlock;
  }
}