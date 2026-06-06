# Banana AI Trading Ecosystem - System Architecture
## Product Vision: The Ultimate Professional AI Trading Assistant

Banana AI is a comprehensive trading ecosystem designed to act as a professional, institutional-grade trading advisor. Instead of blindly executing trades automatically, the system performs deep historical, fundamental, and technical analysis to generate high-confidence trading signals. The user retains full control, manually placing trades (either simulated or real) based on the AI's detailed guidance. 

The platform is built exclusively on **Microsoft Azure** using zero-cost/free-tier tools to remain cost-effective during the initial scaling phases. It specifically targets the Indian Market (Equities, Futures & Options) via legal brokers (Zerodha, Groww), with a robust Simulated "Paper Trading" ecosystem for training both the user and the AI.

---

### High-Level Azure Native Architecture

```mermaid
graph TD
    %% User & Frontend
    User([Trader])
    UI[Next.js Dashboard \n Azure Static Web Apps]
    
    User <-->|HTTPS| UI
    User -->|Manual Trade Execution| UI

    %% Auth & Database
    API[FastAPI Trading Core \n Azure App Service / VM]
    DB[(PostgreSQL DB \n Azure PostgreSQL Free Tier)]
    Redis[(Redis Cache \n Live Tick Data)]
    
    UI <-->|REST / WebSockets| API
    API <--> DB
    API <--> Redis

    %% Multi-Market Data Layer
    subgraph Market Data Layer
        Zerodha[Zerodha / Groww API \n (NSE, BSE, F&O)]
        Historical[Historical Data APIs \n (Yahoo Finance / Custom)]
    end
    
    Zerodha -->|Live Ticks| Redis
    Historical -->|Historical Context| API

    %% AI Advisory Engine
    subgraph AI Intelligence Layer
        Gemini[Google Gemini API \n Sentiment & Deep Market Analysis]
        AIFeedback[(AI Feedback Loop \n Learning Database)]
    end

    API <-->|Deep Analysis Request| Gemini
    API -->|Performance Logging| AIFeedback

    %% Execution Ecosystem
    subgraph Execution Engines
        Paper[Simulated Trading Engine \n (₹2,00,000 Dummy Wallet)]
        Live[Real Broker Execution \n (Manual Trigger via Zerodha/Groww)]
    end
    
    API -->|Route Simulated Trade| Paper
    API -->|Route Real Trade| Live
```

---

### Core Ecosystem Components

#### 1. AI Analysis & Advisory Engine
The brain of the platform. It does not just look at moving averages; it analyzes the market like a human professional.
* **Deep Historical Analysis**: Analyzes past performance, corporate events, and historical price action.
* **Signal Generation**: Provides highly detailed signals to the user:
  * **Confidence Score (%)**: How sure the AI is about the trade.
  * **Expected Profit (%)**: The target gain.
  * **Time Horizon**: The precise time range to enter and exit the trade.
  * **Risk Indicator**: Analysis of maximum potential loss.
* **Feedback Loop (AI Learning)**: When a user places a simulated trade based on an AI signal, the system tracks the outcome. If the trade hits the expected profit, the AI reinforces that logic. The AI continuously learns from simulated outcomes to improve its confidence scores.

#### 2. Dual-Mode Trading Ecosystem
The platform supports two distinct execution environments:
* **Simulation Mode (Paper Trading)**: 
  * Every user gets a dummy wallet loaded with ₹2,00,000.
  * Users can manually place trades using dummy money based on live AI signals.
  * If the wallet runs out, a simple refresh resets the dummy balance back to ₹2,00,000.
  * Simulated profits/losses update the dummy wallet in real-time.
* **Real Broker Integration**:
  * Integration with Indian legal brokers (Zerodha, Groww).
  * Users connect their real accounts, fund their real wallets, and place real trades manually through the Banana AI interface when they trust the AI signals.

#### 3. Backend Architecture (Azure Native & Zero-Cost Focused)
* **Hosting**: Exclusively on Microsoft Azure VMs (or Azure App Service free tiers) to minimize costs. Google Cloud components (Vertex, BigQuery) have been dropped.
* **Hybrid Core**: Python (FastAPI) handles the complex AI orchestration, business logic, and API endpoints. Rust handles any required low-latency WebSocket streaming.
* **Database**: PostgreSQL handles User Accounts, Real/Dummy Wallets, Trade History, and AI Feedback Loops.

#### 4. Frontend Application
* **Next.js Dashboard**: A premium, professional UI where users view deep AI analysis reports, select their investment amounts, toggle between "Simulation" and "Live" modes, and manually execute trades.

---

### Platform Workflow

1. **Market Ingestion**: The backend ingests live ticks and historical data from the Indian Stock Market.
2. **Deep Analysis**: The AI Engine evaluates the data, determining if a profitable opportunity exists in Equities or Options.
3. **Signal Broadcast**: A detailed signal card is pushed to the user's dashboard (Action, Confidence, Target Profit, Time Range).
4. **User Decision**: The user reads the AI's deep analysis and decides the investment amount.
5. **Manual Execution**: The user clicks "Place Trade". They choose whether this goes to their Simulated Wallet or Real Broker Wallet.
6. **AI Learning**: The backend monitors the trade's real-time outcome against the AI's initial prediction, feeding the result back into the AI Learning Database to improve future signals.
