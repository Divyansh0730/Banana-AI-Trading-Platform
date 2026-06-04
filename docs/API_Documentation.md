# API Documentation
## Product Name: Banana AI Trading Platform

The Backend API will be built using **FastAPI (Python)** and hosted on **Google Cloud Run**. It uses REST for standard operations and WebSockets for real-time market data.

### Base URL
`https://api.banana-trading.com/v1`

### Authentication
All protected routes require a `Bearer Token` in the `Authorization` header. This token is a valid JWT issued by **Firebase Auth**.

---

### 1. User Settings & Account API

#### `GET /user/settings`
Fetch current risk settings and paper trading status.
*   **Response**: `200 OK`
```json
{
  "is_paper_trading": true,
  "max_risk_pct": 1.5,
  "daily_loss_limit_pct": 3.0
}
```

#### `PUT /user/settings`
Update trading preferences.
*   **Payload**: `{"is_paper_trading": false}`
*   **Response**: `200 OK`

---

### 2. Exchange API Keys Management

#### `POST /exchange/keys`
Securely add Binance/Bybit API keys. (Keys are encrypted before storing in Supabase).
*   **Payload**:
```json
{
  "exchange": "binance",
  "api_key": "YOUR_KEY",
  "api_secret": "YOUR_SECRET"
}
```
*   **Response**: `201 Created`

---

### 3. Trading & Signals API

#### `GET /trades/history`
Get historical trades (Paper and Live).
*   **Query Params**: `?is_paper=true&limit=50`
*   **Response**:
```json
[
  {
    "id": "1234",
    "symbol": "BTC/USDT",
    "side": "BUY",
    "pnl": 45.20,
    "status": "CLOSED"
  }
]
```

#### `GET /signals/latest`
Fetch the most recent AI-generated trading signals.
*   **Response**:
```json
[
  {
    "symbol": "ETH/USDT",
    "signal": "BUY",
    "confidence": 88.5,
    "ai_reasoning": "RSI oversold on 15m chart. MACD crossover detected."
  }
]
```

#### `POST /trade/manual`
(Optional) Manually override AI and execute a trade.
*   **Payload**:
```json
{
  "symbol": "BTC/USDT",
  "side": "SELL",
  "quantity": 0.1
}
```

---

### 4. WebSocket Streams (Real-time Data)

#### `WSS wss://api.banana-trading.com/ws/market`
Streams live price ticks to the frontend.
*   **Message Format**:
```json
{
  "event": "price_update",
  "data": { "symbol": "BTC/USDT", "price": 64200.50 }
}
```
*(Note: Portfolio balance updates will be handled natively via Firebase Firestore real-time listeners on the frontend).*
