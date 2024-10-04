const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

let balance = 1000; // Initial balance
let stockOwned = 0; // No stocks owned at start
let tradeHistory = []; // To track trades

// Basic trading parameters
const buyThreshold = 0.98; // Buy when price drops by 2%
const sellThreshold = 1.03; // Sell when price rises by 3%
const shortTermPeriod = 5; // Short-term moving average period
const longTermPeriod = 10; // Long-term moving average period

let stockPrices = []; // To store recent stock prices for moving averages

// Fetch stock price from mock API
async function fetchStockPrice() {
    try {
        const response = await axios.get('http://localhost:4000/api/stock'); // Adjust this based on your mock server
        return response.data.stockPrice;
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return null;
    }
}

// Calculate moving average
function calculateMovingAverage(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
}

// Trading logic
async function tradeLogic() {
    const currentPrice = await fetchStockPrice();
    if (currentPrice === null) return; // Exit if no price available

    console.log(`Current Stock Price: ${currentPrice}`);

    // Store the current price for moving average calculation
    stockPrices.push(currentPrice);

    // Calculate short-term and long-term moving averages
    const shortTermMA = calculateMovingAverage(stockPrices, shortTermPeriod);
    const longTermMA = calculateMovingAverage(stockPrices, longTermPeriod);

    // Implement moving average crossover strategy
    if (shortTermMA !== null && longTermMA !== null) {
        console.log(`Short-Term MA: ${shortTermMA}, Long-Term MA: ${longTermMA}`);

        // Buy signal: Short-term MA crosses above long-term MA
        if (shortTermMA > longTermMA && stockOwned === 0) {
            const sharesToBuy = Math.floor(balance / currentPrice); // Buy as many shares as possible
            if (sharesToBuy > 0) {
                balance -= sharesToBuy * currentPrice; // Deduct cost from balance
                stockOwned += sharesToBuy; // Increase stocks owned
                tradeHistory.push({
                    type: 'BUY',
                    price: currentPrice,
                    shares: sharesToBuy,
                    balance: balance,
                    stockOwned: stockOwned,
                    date: new Date(),
                });
                console.log(`Bought ${sharesToBuy} shares at ${currentPrice}. New balance: ${balance}`);
            }
        }

        // Sell signal: Short-term MA crosses below long-term MA
        if (shortTermMA < longTermMA && stockOwned > 0) {
            balance += currentPrice * stockOwned; // Add to balance from selling
            tradeHistory.push({
                type: 'SELL',
                price: currentPrice,
                shares: stockOwned,
                balance: balance,
                stockOwned: 0,
                date: new Date(),
            });
            console.log(`Sold ${stockOwned} shares at ${currentPrice}. New balance: ${balance}`);
            stockOwned = 0; // Reset stocks owned after selling
        }
    }

    // Determine if we should buy based on percentage drop
    if (currentPrice <= (balance * buyThreshold) / (stockOwned + 1)) {
        const sharesToBuy = Math.floor(balance / currentPrice); // Buy as many shares as possible
        if (sharesToBuy > 0) {
            balance -= sharesToBuy * currentPrice; // Deduct cost from balance
            stockOwned += sharesToBuy; // Increase stocks owned
            tradeHistory.push({
                type: 'BUY',
                price: currentPrice,
                shares: sharesToBuy,
                balance: balance,
                stockOwned: stockOwned,
                date: new Date(),
            });
            console.log(`Bought ${sharesToBuy} shares at ${currentPrice}. New balance: ${balance}`);
        }
    }

    // Determine if we should sell based on percentage rise
    if (stockOwned > 0 && currentPrice >= (currentPrice / sellThreshold)) {
        balance += currentPrice * stockOwned; // Add to balance from selling
        tradeHistory.push({
            type: 'SELL',
            price: currentPrice,
            shares: stockOwned,
            balance: balance,
            stockOwned: 0,
            date: new Date(),
        });
        console.log(`Sold ${stockOwned} shares at ${currentPrice}. New balance: ${balance}`);
        stockOwned = 0; // Reset stocks owned after selling
    }
}

// Run the trading logic at regular intervals
setInterval(tradeLogic, 5000); // Check every 5 seconds

// API endpoint to get stock status
app.get('/api/stock', async (req, res) => {
    const stockPrice = await fetchStockPrice(); // Now correctly using async/await
    res.json({
        stockPrice,
        balance,
        stockOwned,
        tradeHistory,
    });
});

// API endpoint to get trade history
app.get('/api/trade-history', (req, res) => {
    res.json(tradeHistory);
});

// API endpoint for summary report
app.get('/api/report', (req, res) => {
    const totalProfitLoss = calculateTotalProfitLoss(); // Calculate total profit/loss
    res.json({
        totalTrades: tradeHistory.length,
        totalProfitLoss,
        currentBalance: balance,
        stocksOwned: stockOwned,
        finalStatement: getFinalStatement(),
    });
});

// Calculate total profit/loss from trades
function calculateTotalProfitLoss() {
    const initialInvestment = 1000; // Initial balance
    const totalSpent = tradeHistory.filter(trade => trade.type === 'BUY')
        .reduce((total, trade) => total + (trade.price * trade.shares), 0);
    const totalEarned = tradeHistory.filter(trade => trade.type === 'SELL')
        .reduce((total, trade) => total + (trade.price * trade.shares), 0);

    return (balance + totalEarned) - totalSpent; // Total profit/loss
}

// Generate final statement
function getFinalStatement() {
    let statement = 'Final Trade Statement:\n';
    tradeHistory.forEach(trade => {
        statement += `${trade.type} - ${trade.shares} shares at $${trade.price} on ${trade.date.toLocaleString()}\n`;
    });
    statement += `Current Balance: $${balance}\n`;
    statement += `Stocks Owned: ${stockOwned}\n`;
    statement += `Total Profit/Loss: $${calculateTotalProfitLoss()}\n`;
    return statement;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Trading bot running on http://localhost:${PORT}`);
});
