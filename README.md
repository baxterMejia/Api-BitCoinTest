# Api-BitCoinTest
Bitcoin & Market Metrics API

This is a simple Express.js API used to provide Bitcoin monthly high/low prices and market distribution data.
It is designed as part of a Full Stack Dashboard project.

📌 Example API Name

MarketPulse API

Features

User Authentication (JWT)

Monthly Bitcoin High/Low Price Data

Market Distribution Data (Top 3 Coins)

Token Validation Middleware

CORS & Body Parser enabled

Ready for deployment (Render, Railway, etc.)

Endpoints

🔑 Auth

POST /api/login
Request:

{
  "email": "Johan@mejia.io",
  "password": "Secret1"
}

Response:

{
  "token": "your-jwt-token"
}

👤 Get Users

GET /api/users
Requires Bearer Token

📈 Bitcoin Monthly Highs/Lows

GET /api/bitcoin/monthly-highs-lows
Returns monthly max/min price for Bitcoin in the last year.

🌍 Market Distribution

GET /api/market-distribution
Returns market cap distribution for top 3 cryptocurrencies.

Environment Variables

Create a .env.local file with:

PORT=5000
SECRET_KEY=secret1

Installation & Usage

# Install dependencies
npm install

# Run the server
npm start