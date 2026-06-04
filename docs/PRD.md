# Product Requirements Document (PRD)
## Product Name: Banana AI Trading Platform (Global Omni-Asset Edition)

### 1. Product Vision
To build an "Expert-Level" AI Trading SaaS that is virtually indistinguishable from institutional quantitative hedge funds. It will provide **Real-Time** trading capabilities across **ALL global asset classes** (Indian, US, Forex, Crypto). Additionally, it will feature an integrated educational hub to teach users how the AI works and how to generate consistent profits.

### 2. Target Audience
*   **Global & Indian Retail Traders**: Looking for a single platform to trade any asset in the world using expert AI.
*   **Beginners**: Users who want to learn how algorithmic trading works via built-in tutorials.

### 3. Supported Asset Classes (The "Omni-Market" Approach)
The platform will support real-time data ingestion and execution for:
*   **Indian Markets (NSE/BSE/MCX)**: Equity, Futures, Options (Nifty/BankNifty), Commodities.
*   **Foreign Markets (US Stocks)**: NASDAQ, NYSE (via Alpaca or Interactive Brokers API).
*   **Global Forex (Currency)**: EUR/USD, GBP/JPY (via Forex broker APIs).
*   **Cryptocurrency**: Spot and Perpetual Futures (via Binance/Bybit).

### 4. Core Features

#### 4.1. "Expert-Level" AI Intelligence
*   The AI will not just be a simple bot; it will be a **Multi-Agent System**.
*   It will combine Deep Reinforcement Learning (FinRL) with Macro-economic reasoning (Gemini) to trade like a seasoned Wall Street expert. It will learn from its mistakes and adapt to changing market regimes.

#### 4.2. Universal Real-Time Execution Engine
*   A custom, ultra-fast FastAPI backend connected to Google Cloud Pub/Sub.
*   It will handle WebSocket streams from multiple global exchanges simultaneously, ensuring zero-lag execution.

#### 4.3. The "Banana Trading Academy" (Educational Hub)
*   **Interactive Tutorials**: A dedicated section explaining *how* the AI makes decisions.
*   **Profit Guides**: Step-by-step guides on how users can optimize their Risk Settings to make real money.
*   **Explainable AI**: Every trade taken by the AI will have a "Why did I take this trade?" button, translating complex math into simple English for the user to learn from.

#### 4.4. Dual Execution Modes
*   **Paper Trading (Simulation)**: Risk-free testing on live global data.
*   **Live Trading**: Real-money execution via connected broker APIs.

### 5. Success Metrics (KPIs)
*   **Market Penetration**: Successfully executing trades across 4 different asset classes (Crypto, US Stocks, Indian Equity, Forex) from a single dashboard.
*   **Latency**: Sub-100ms execution across all supported global APIs.
