# System Architecture Diagram
## Product Name: Banana AI Trading Platform (Global & Indian Markets)

The architecture is designed to handle multiple asset classes (Crypto, Indian Equity, F&O) via a custom, low-latency API gateway, integrating with both Global and Indian brokers.

### High-Level Google Cloud Native Architecture

```mermaid
graph TD
    %% User & Frontend
    User([Trader])
    UI[Next.js Dashboard \n Firebase Hosting]
    Telegram[Telegram / WhatsApp Bot \n Alerts]
    
    User <-->|HTTPS| UI
    User <-->|Notifications| Telegram

    %% Auth & Realtime DB (Firebase)
    Auth[Firebase Auth]
    RTDB[(Firestore \n Live Portfolio Sync)]
    
    UI --> Auth
    UI <--> RTDB

    %% Backend API (Cloud Run)
    API[FastAPI Trading Core \n Google Cloud Run]
    
    UI <-->|REST| API
    Telegram <--> API
    Auth -.->|JWT Token Validation| API

    %% Databases
    DB[(Supabase PostgreSQL \n Users, Broker Keys)]
    BQ[(Google BigQuery \n Market Data Lake)]
    Storage[(Google Cloud Storage \n AI Models)]
    
    API <--> DB
    API -->|Async Logging| BQ

    %% Multi-Market Data & Execution
    subgraph Execution & Data Layer
        Zerodha[Zerodha / Dhan API \n (NSE, BSE, F&O)]
        Binance[Binance API \n (Crypto)]
        OptionChain[Option Chain Data \n (Greeks, PCR, OI)]
    end
    
    PubSub[Google Cloud Pub/Sub \n Event Bus]
    
    Zerodha -->|Live Ticks| PubSub
    Binance -->|WebSockets| PubSub
    OptionChain --> PubSub
    PubSub -->|Trigger| API
    API -->|Execute Indian Trade| Zerodha
    API -->|Execute Crypto Trade| Binance

    %% AI Layer (FinRL + Vertex + Gemini)
    Vertex[Vertex AI \n GRU/LSTM + FinRL Agents]
    Gemini[Google Gemini API \n Sentiment & Options Logic]
    CloudFunc[Cloud Functions \n Cron Jobs]

    API <-->|High Frequency Prediction| Vertex
    API <-->|Macro Analysis| Gemini
    CloudFunc -->|Daily Retraining Trigger| Vertex
```

### Component Breakdown

1.  **Frontend (Next.js)**: Dashboard showing multi-asset portfolios (Crypto + Indian Stocks + Options).
2.  **Custom FastAPI Backend**: Instead of using Freqtrade (which is crypto-only), we build a custom engine that handles OAuth for Indian brokers (Zerodha/Dhan) and API keys for Crypto (Binance). We will study Freqtrade's source code to implement robust Risk Management logic.
3.  **Multi-Market Ingestion (Pub/Sub)**: Ingests tick data for NSE, BSE, and Crypto simultaneously. Also fetches complex data like Option Chains (Open Interest, Implied Volatility).
4.  **Google BigQuery**: The Data Lake. Critical for storing massive Option Chain historical data which is required to train AI on derivatives.
5.  **AI Layer (FinRL + Gemini)**:
    *   **FinRL on Vertex AI**: Trains Reinforcement Learning agents that learn to maximize portfolio value across Stocks and Options.
    *   **Google Gemini**: Used to analyze breaking news (e.g., RBI Repo Rate announcements) and adjust the AI's risk appetite dynamically.
6.  **Telegram/WhatsApp Bot**: Essential for the Indian market to provide instant trade confirmations and margin alerts.
