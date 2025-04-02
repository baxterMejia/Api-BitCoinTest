const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const USERS = [{ id: 1, username: 'Johan@mejia.io', password: 'Secret1' }];
const SECRET_KEY = 'secret1';

// Middleware token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Token required');

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).send('Invalid token');
        req.user = decoded;
        next();
    });
}

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = USERS.find(u => u.username === email && u.password === password);
    if (!user) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Users protected
app.get('/api/users', verifyToken, (req, res) => {
    res.json(USERS);
});

// CACHE
let cachedMonthlyData = null;
let cachedMarketData = null;
let lastMonthlyFetch = 0;
let lastMarketFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Monthly Highs/Lows
app.get('/api/bitcoin/monthly-highs-lows', async (req, res) => {
    const now = Date.now();
    if (cachedMonthlyData && now - lastMonthlyFetch < CACHE_DURATION) {
        return res.json(cachedMonthlyData);
    }

    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart', {
            params: { vs_currency: 'usd', days: 365, interval: 'daily' },
        });

        const prices = response.data.prices;
        const monthlyData = {};

        prices.forEach(([timestamp, price]) => {
            const date = new Date(timestamp);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[month]) {
                monthlyData[month] = { high: price, low: price };
            } else {
                if (price > monthlyData[month].high) {
                    monthlyData[month].high = price;
                }
                if (price < monthlyData[month].low) {
                    monthlyData[month].low = price;
                }
            }
        });

        const result = Object.entries(monthlyData).map(([month, data]) => ({
            month,
            high: data.high.toFixed(2),
            low: data.low.toFixed(2),
        }));

        cachedMonthlyData = result;
        lastMonthlyFetch = now;
        res.json(result);
    } catch (error) {
        console.error('Error fetching Bitcoin data:', error.message);

        // ✅ Dummy Data para los 12 meses
        const dummyData = [
            { month: '2024-01', high: '47000.00', low: '42000.00' },
            { month: '2024-02', high: '52000.00', low: '48000.00' },
            { month: '2024-03', high: '60000.00', low: '55000.00' },
            { month: '2024-04', high: '68000.00', low: '64000.00' },
            { month: '2024-05', high: '72000.00', low: '68000.00' },
            { month: '2024-06', high: '75000.00', low: '70000.00' },
            { month: '2024-07', high: '78000.00', low: '73000.00' },
            { month: '2024-08', high: '80000.00', low: '75000.00' },
            { month: '2024-09', high: '82000.00', low: '77000.00' },
            { month: '2024-10', high: '85000.00', low: '80000.00' },
            { month: '2024-11', high: '87000.00', low: '83000.00' },
            { month: '2024-12', high: '90000.00', low: '86000.00' },
        ];

        res.status(200).json(dummyData);
    }
});

// Market Distribution
app.get('/api/market-distribution', async (req, res) => {
    const now = Date.now();
    if (cachedMarketData && now - lastMarketFetch < CACHE_DURATION) {
        return res.json(cachedMarketData);
    }

    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 3,
                page: 1,
            },
        });

        const totalMarketCap = response.data.reduce((sum, coin) => sum + coin.market_cap, 0);

        const result = response.data.map((coin) => ({
            name: coin.name,
            percentage: ((coin.market_cap / totalMarketCap) * 100).toFixed(2),
        }));

        cachedMarketData = result;
        lastMarketFetch = now;
        res.json(result);
    } catch (error) {
        console.error('Error fetching market distribution data:', error.message);
        res.status(500).json({ message: 'Failed to fetch market distribution data' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
