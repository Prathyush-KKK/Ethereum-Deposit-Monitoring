const express = require('express');
const { Registry, Counter, Gauge } = require('prom-client');
const { startPrometheusMetricsFetcher } = require('../core/services/fetchDeposit');

const app = express();
const register = new Registry();

const depositsTotal = new Counter({
  name: 'crypto_deposits_total',
  help: 'Total number of crypto deposits',
  labelNames: ['blockchain', 'network', 'token'],
  registers: [register]
});

const latestBlockNumber = new Gauge({
  name: 'crypto_deposits_latest_block',
  help: 'Latest block number processed',
  labelNames: ['blockchain', 'network'],
  registers: [register]
});

app.get('/metrics', async (req, res) => {
  try {
    const depositsFetcherService = await startPrometheusMetricsFetcher();
    const deposits = await depositsFetcherService.getDeposits({}); // Customize query logic

    deposits.forEach(deposit => {
      depositsTotal.labels(deposit.blockchain, deposit.network, deposit.token).inc();
      latestBlockNumber.labels(deposit.blockchain, deposit.network).set(deposit.blockNumber);
    });

    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3001, () => {
  console.log('Prometheus metrics server running on port 3001');
});
