  # Ethereum Deposit Monitoring

  ## Project Overview

  The Ethereum Deposit Monitor is designed to monitor and record ETH deposits made to the Beacon Deposit Contract at address `0x00000000219ab540356cBB839Cbe05303d7705Fa`. (Ethereum 2.0 Beacon Chain) This tracker fetches real-time deposit data, handles multiple deposits in single transactions, logs relevant deposit details, and provides optional alerting and dashboard features for better visibility.

  ## Features

  * **Real-Time Deposit Tracking**: Monitors incoming ETH deposits to the Beacon Deposit Contract.
  * **Multiple Deposit Handling**: Efficiently processes transactions containing multiple deposits.
  * **Error Handling**: Comprehensive error management for API and RPC interactions.
  * **Logging**: Tracks important events and errors.
  * **Alerts & Dashboards**: Integrates Telegram notifications and Grafana dashboard for real-time monitoring.

  ## Project Structure

  ![image](https://github.com/user-attachments/assets/10af617f-b5d3-4bdb-a50a-e3fed4bd6d99)


  ## Prerequisites

  Before you begin, ensure you have the following installed:

  * **Node.js** (v14+)
  * **npm** or **yarn**
  * **Ethereum Node Provider**: Alchemy (or Infura, if used)
  * **Docker** (Optional: For containerization)
  * **Grafana** (Optional: For monitoring and visualization)
  * **Telegram** (Optional: For alert notifications)

  ### Obtain Required Keys and Tokens

  1. **Alchemy Key**: Sign up at [Alchemy](https://www.alchemy.com/) to obtain your API key for Ethereum RPC access.
  2. **MongoDB URI**: Create an account and get your connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). This is needed for connecting to your MongoDB instance. Make sure to have whitelisted your IP if you are using Atlas.
  3. **Ethereum Block Number**: Specify the starting block number from which to track Ethereum deposits. Choose according to your needs.
  4. **Telegram Bot Token**: Create a bot and get the token by talking to [BotFather](https://core.telegram.org/bots#botfather) on Telegram.

  ## Setup Instructions

  1. **Clone the Repository**:

      ```bash
      git clone https://github.com/Prathyush-KKK/luganodes-ethmon.git
      cd luganodes-ethmon
      ```

  2. **Install Dependencies**:
    
      Run the following command to install the required Node.js dependencies:

      ```bash
      npm install
      ```

  3. **Configure Environment Variables**:
    
  **Option 1:** Rename the .env.example file to .env in the root directory.
    ```bash
    mv .env.example .env
    ```
    <br>
  **Option 2:** Create a new .env file in the root directory and add the required environment variables as specified in the file itself or the documentation (if available). Be sure not to commit your .env file to version control.

    ALCHEMY_API_KEY=Alchemy Key
    MONGO_URI=MongoDB URI
    ETH_BLOCK_FROM=Ethereum Block Number
    TELEGRAM_NOTIFICATIONS_BOT_TOKEN=Telegram Bot Token
    TELEGRAM_NOTIFICATIONS_CHAT_ID=Telegram Chat Token

  ##   **Run the Tracker**:
    
   Similar to the `.env.example` file, you need to add a `docker-compose.yml` file to your project root. This file defines the services required to run your application and any dependencies.


      To start monitoring deposits, run:

      ```bash
      npm run dev
      ```
      ```bash
      npm run dev-api
      ```
![image](https://github.com/user-attachments/assets/103c2452-3826-4f62-8862-0cbcdb3b1863)


  ## Running the Project with Docker

  ### 1. Build the Docker File

  ```bash
  docker-compose up --build
  ```
    **Accessing Services**
``bash
  npm run dev
  ```

  Once the containers are running, you can access the following services:

  - **Prometheus**: Open your web browser and navigate to [http://localhost:9090](http://localhost:9090) to access Prometheus, where you can query and visualize metrics.
  - **Grafana**: Open your web browser and navigate to [http://localhost:3000](http://localhost:3000) to access Grafana. You can set up dashboards to visualize deposit data and system metrics.

  ## Stopping the Containers

  To stop and remove the Docker containers, you can run:

  ```bash
  docker-compose down
  ```

  ## Telegram Bot Setup and Notifications
  ### Finding Your Telegram Bot

  **Create a Bot:**

  1. Open the Telegram app on your device.
  2. Search for the user BotFather.
  3. Start a chat with BotFather and use the command /newbot to   create a new bot.
  4. Follow the instructions to set up your bot and receive the Bot Token. This token is required for the bot to authenticate and send messages.

  **Get Your Chat ID:**

  1. Start a chat with your new bot by searching for its username on Telegram and sending a message.
  2. To obtain your Chat ID, use the following method:
  3. Visit this URL in your browser, replacing <YourBotToken> with the token you received from BotFather.
  4. Look for the chat object in the JSON response to find your Chat ID.
   ![image](https://github.com/user-attachments/assets/ccf182e8-36e4-4944-8d00-ef654ed3dc08)
