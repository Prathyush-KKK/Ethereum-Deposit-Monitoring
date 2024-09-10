import { Deposit, DepositSchema } from "core/domain/deposit";
import {
  IBlockchainGateway,
  INotifierGateway,
  TransactionData,
} from "core/types.gateways";
import { IDepositsRepository } from "core/types.repositories";
import { DepositsTrackerService as IDepositsTrackerService } from "core/types.services";

// DONE - Implemented storing the last block in the processBlockTransactions and processBlockTransactionsFrom

export class DepositsTrackerService implements IDepositsTrackerService {
  private blockchainGateway: IBlockchainGateway;
  private notificatorGateway: INotifierGateway | undefined;
  private depositsRepository: IDepositsRepository;
  private filterIn: string[];

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

    if (this.filterIn.length) {
      console.info(
        `Filtering deposits for addresses: ${this.filterIn.join(", ")}`
      );
    }

    // Send a notification
    this.notificatorGateway?.sendNotification(`Deposits tracker service started`);
  }

  // Process the last block's transactions in batches
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

        // Update last processed block after batch processing
        if (typeof blockNumberOrHash === "number") {
          await this.depositsRepository.updateLastProcessedBlock(blockNumberOrHash);
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
    const lastStoredBlockNumber =
      (await this.depositsRepository.getLatestStoredBlock()) || blockNumber;
    if (lastStoredBlockNumber) {
      console.info(
        `Executing block txs processing from block number ${lastStoredBlockNumber}`
      );
    }

    const latestBlock = await this.blockchainGateway.getBlockNumber();
    console.info(`Latest block number: ${latestBlock}`);

    for (let i = lastStoredBlockNumber; i <= latestBlock; i++) {
      await this.processBlockTransactions(i);

      // After processing each block, store the last processed block number
      await this.depositsRepository.updateLastProcessedBlock(i);
    }

    console.info(
      `Finished processing blocks from ${lastStoredBlockNumber} to ${latestBlock}`
    );
  }

  // Listen to pending transactions in real-time
  public startPendingTransactionsListener(): void {
    this.blockchainGateway.watchPendingTransactions((tx: TransactionData) => {
      this.processTransaction(tx);
    });
  }

  // Listen to new minted blocks in real-time
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

      // Validate the deposit schema
      DepositSchema.parse(deposit);

      // Save the deposit to the storage repository
      await this.depositsRepository.storeDeposit(deposit);

      // Send a notification
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
}
