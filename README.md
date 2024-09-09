# Ethereum Deposit Monitoring

## Project Overview

The Ethereum Deposit Monitor is designed to monitor and record ETH deposits made to the Beacon Deposit Contract at address `0x00000000219ab540356cBB839Cbe05303d7705Fa`. This tracker fetches real-time deposit data, handles multiple deposits in single transactions, logs relevant deposit details, and provides optional alerting and dashboard features for better visibility.

## Features

* **Real-Time Deposit Tracking**: Monitors incoming ETH deposits to the Beacon Deposit Contract.
* **Multiple Deposit Handling**: Efficiently processes transactions containing multiple deposits.
* **Error Handling**: Comprehensive error management for API and RPC interactions.
* **Logging**: Tracks important events and errors.
* **Alerts & Dashboards**: Integrates Telegram notifications and Grafana dashboard for real-time monitoring.

## Project Structure

*Will be updated…*

## Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (v14+)
* **npm** or **yarn**
* **Ethereum Node Provider**: Alchemy (or Infura, if used)
* **Docker** (Optional: For containerization)
* **Grafana** (Optional: For monitoring and visualization)
* **Telegram** (Optional: For alert notifications)

## Setup Instructions

1. **Clone the Repository**:

    ```bash
    git clone https://github.com/Prathyush-KKK/luganodes-ethmon.git
    cd eth-deposit-tracker
    ```

2. **Install Dependencies**:
   
    Run the following command to install the required Node.js dependencies:

    ```bash
    npm install
    ```

3. **Configure Environment Variables**:

   will be updated...

4. **Run the Tracker**:
   
    To start monitoring deposits, run:

    ```bash
    npm run start
    ```

## Configuration

will be updated...


