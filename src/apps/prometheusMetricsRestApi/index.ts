import express, { Request, Response } from "express";
import { getDepositsFetcherService } from "./context";
import { Registry, Counter, Gauge } from "prom-client";

// Initialize Express app
const app = express();

// Create a Registry
const register = new Registry();

// Define metrics
const depositsTotal = new Counter({
  name: "crypto_deposits_total",
  help: "Total number of crypto deposits",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

const latestBlockNumber = new Gauge({
  name: "crypto_deposits_latest_block",
  help: "Latest block number processed",
  labelNames: ["blockchain", "network"],
  registers: [register],
});

const latestBlockTimestamp = new Gauge({
  name: "crypto_deposits_latest_timestamp",
  help: "Timestamp of the latest processed block",
  labelNames: ["blockchain", "network"],
  registers: [register],
});

// Middleware to parse JSON
app.use(express.json());

// Define the metrics endpoint
app.get("/prometheus", async (req: Request, res: Response) => {
  const { blockchain, network, token } = req.query;

  // Current timestamp - 15 minutes (to be more flexible), converted to seconds
  const fifteenMinutesAgo = Math.floor((Date.now() - 15 * 60 * 1000) / 1000);

  // Check if all required parameters are present
  if (!blockchain || !network || !token) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    const depositsFetcherService = await getDepositsFetcherService();

    // Query the database for deposits matching the parameters
    const deposits = await depositsFetcherService.getDeposits({
      blockchain: blockchain as string,
      network: network as string,
      token: token as string,
      blockTimestamp: fifteenMinutesAgo, // Fetch deposits from the last 15 minutes
    });

    // Log the fetched deposits for debugging
    console.log(`Deposits fetched: ${deposits.length}`);
    
    if (deposits.length === 0) {
      console.log("No deposits found in the last 15 minutes");
    }

    // Update Prometheus metrics
    deposits.forEach((deposit) => {
      console.log(`Deposit: ${JSON.stringify(deposit)}`);
      const blockNumber = Number(deposit.blockNumber);
      const blockTimestamp = Number(deposit.blockTimestamp);

      depositsTotal
        .labels(deposit.blockchain, deposit.network, deposit.token)
        .inc(); // Increment the counter
      latestBlockNumber
        .labels(deposit.blockchain, deposit.network)
        .set(blockNumber); // Set the latest block number
      latestBlockTimestamp
        .labels(deposit.blockchain, deposit.network)
        .set(blockTimestamp); // Set the latest block timestamp
    });

    // Return the metrics in Prometheus format
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
    console.log("Metrics sent to Prometheus");
  } catch (error) {
    console.error("Error querying deposits:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    app.listen(3005, () => {
      console.log(`Server is running on http://localhost:3005`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
