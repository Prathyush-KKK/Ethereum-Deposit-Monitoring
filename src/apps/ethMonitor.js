const express = require('express');
const createConnection = require('../database/createMongooseConnection');
const envs = require('../utils/env');
const { startEthBeaconMonitor } = require('../core/services/serviceMonitor');

const app = express();
const port = 3000;

createConnection(); // Connect to MongoDB

// Start the Ethereum Beacon Monitor service
const startService = async () => {
  const ethBeaconService = await startEthBeaconMonitor();
  ethBeaconService.processBlockTransactionsFrom(envs.ETH_BLOCK_FROM);
  ethBeaconService.startMintedBlocksListener();
};

startService();

// Start Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
