const dotenv = require('dotenv');
dotenv.config();

const envs = {
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
  MONGO_URI: process.env.MONGO_URI,
  ETH_BLOCK_FROM: parseInt(process.env.ETH_BLOCK_FROM),
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID
};

module.exports = envs;
