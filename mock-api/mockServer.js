const express = require('express');
const app = express();
const PORT = 4000;

// Simulate stock prices
let currentPrice = 100;

// Function to generate random stock prices
function generateRandomPrice() {
    // Simulate stock price change by a random percentage
    const change = (Math.random() - 0.5) * 10; // Change price by ±5
    currentPrice = parseFloat((currentPrice + change).toFixed(2)); // Limit to 2 decimal points
    return currentPrice;
}

// API endpoint to get the current stock price
app.get('/api/stock', (req, res) => {
    const stockPrice = generateRandomPrice(); // Update price
    res.json({ stockPrice });
});

// Start the mock server
app.listen(PORT, () => {
    console.log(`Mock API running on http://localhost:${PORT}`);
});
