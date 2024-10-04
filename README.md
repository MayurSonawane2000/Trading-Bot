# Trading Bot

## Overview

This project simulates a basic trading bot for a hypothetical stock market using Node.js. The bot continuously monitors stock prices and executes trades based on predefined strategies while tracking its profit/loss and performance metrics.

## Trading Logic

The trading bot implements the following strategies:

1. **Moving Average Crossover**:
   - The bot calculates short-term and long-term moving averages of stock prices.
   - **Buy Signal**: When the short-term moving average crosses above the long-term moving average, the bot buys shares.
   - **Sell Signal**: When the short-term moving average crosses below the long-term moving average, the bot sells any shares it owns.

2. **Percentage-Based Trading**:
   - The bot will buy shares when the stock price drops by 2% compared to the last purchase price.
   - It will sell shares when the stock price increases by 3% compared to the purchase price.

## Mock API

### Base URL
- The base URL for the mock API is: `http://localhost:4000`

### Mock API Code

```javascript
// mockServer.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

let currentPrice = 100; // Initial stock price

app.use(cors());

// Simulate stock price changes
setInterval(() => {
    const change = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2); // Random change between -2 and 2
    currentPrice = (currentPrice + change).toFixed(2);
}, 3000); // Change every 3 seconds

app.get('/api/stock', (req, res) => {
    res.json({ stockPrice: currentPrice });
});

app.listen(PORT, () => {
    console.log(`Mock API running on http://localhost:${PORT}`);
});
