# Database Schema Design
## Product Name: Banana AI Trading Platform

Hosted on **Supabase (PostgreSQL)**, updated to support multi-asset trading.

### 1. `users` Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_tier VARCHAR(50) DEFAULT 'free'
);
```

### 2. `broker_credentials` Table (Replaces exchange_keys)
Supports both API Keys (Crypto) and OAuth Tokens (Indian Brokers).
```sql
CREATE TABLE broker_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    broker_name VARCHAR(50) NOT NULL, -- 'zerodha', 'dhan', 'binance'
    api_key VARCHAR(255),
    api_secret VARCHAR(512), -- Encrypted
    access_token TEXT, -- For OAuth brokers (Zerodha/Dhan)
    refresh_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. `trades` Table (Multi-Asset)
Expanded to handle Options, Futures, and Expiry dates.
```sql
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    broker_name VARCHAR(50) NOT NULL,
    asset_class VARCHAR(20) NOT NULL, -- 'EQUITY', 'CRYPTO', 'OPTION', 'FUTURE'
    symbol VARCHAR(50) NOT NULL, -- e.g., 'RELIANCE', 'BTCUSDT', 'NIFTY24MAY22000CE'
    expiry_date DATE, -- Null for Cash/Crypto
    strike_price DECIMAL(18, 4), -- Null for Cash/Crypto
    option_type VARCHAR(2), -- 'CE' or 'PE'
    side VARCHAR(10) NOT NULL, -- 'BUY', 'SELL'
    order_type VARCHAR(20) NOT NULL,
    quantity DECIMAL(18, 8) NOT NULL,
    entry_price DECIMAL(18, 8) NOT NULL,
    exit_price DECIMAL(18, 8),
    status VARCHAR(20) DEFAULT 'OPEN',
    pnl DECIMAL(18, 8) DEFAULT 0.0,
    is_paper_trade BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);
```

### 4. `ai_signals` Table
```sql
CREATE TABLE ai_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(50) NOT NULL,
    asset_class VARCHAR(20) NOT NULL,
    signal_type VARCHAR(10) NOT NULL,
    confidence_score DECIMAL(5, 2) NOT NULL,
    ai_model_used VARCHAR(50) NOT NULL, -- 'finrl_ppo', 'gemini_pro'
    reasoning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
