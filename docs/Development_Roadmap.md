# 90-Day Development Roadmap
## Product Name: Banana AI Trading Platform

This sprint plan outlines how to build and deploy the platform from scratch, utilizing Google Services and Free Tiers, to reach MVP (Minimum Viable Product).

---

### Phase 1: Foundation & Data (Days 1 - 20)
**Goal:** Setup infrastructure, database, and connect to real-time market data.

*   **Week 1**: 
    *   Set up Next.js project on Vercel/Firebase.
    *   Configure Firebase Authentication.
    *   Create Supabase PostgreSQL database and run schema migrations.
*   **Week 2**: 
    *   Set up FastAPI Python backend.
    *   Implement WebSocket connection to Binance/Bybit for live price streaming.
    *   Write scripts to calculate basic technical indicators (RSI, MACD) in real-time.
*   **Week 3**: 
    *   Build the Trading Engine module.
    *   Implement "Paper Trading" logic (saving mock trades to Supabase).

---

### Phase 2: AI Integration & Testing (Days 21 - 50)
**Goal:** Train local models, integrate Gemini, and run Paper Trading simulations.

*   **Week 4**: 
    *   Use Google Colab to train an initial XGBoost model on historical data.
    *   Deploy the model into the FastAPI backend (Local AI Layer).
*   **Week 5**: 
    *   Integrate Google Gemini API for macro-sentiment analysis fallback.
    *   Implement the Risk Management rules (Max Drawdown, Dynamic Stop-Loss).
*   **Week 6**: 
    *   Run the AI strictly on **Paper Trading Mode** for 7 days.
    *   Build the frontend dashboard to monitor the Paper Trading PnL in real-time using Firebase Firestore.
*   **Week 7**: 
    *   Analyze Paper Trading results. Re-tune AI hyperparameters in Colab to fix false signals.

---

### Phase 3: Live Execution & SaaS Prep (Days 51 - 80)
**Goal:** Connect real Exchange APIs and prepare the platform for multiple users.

*   **Week 8**: 
    *   Implement secure encryption for saving User API Keys (AES-256).
    *   Integrate the backend to send REAL orders to Binance/Bybit APIs.
*   **Week 9**: 
    *   **Go Live (Internal)**: Deposit a small real-money amount ($50) and let the AI trade live to verify execution latency and slippage.
*   **Week 10**: 
    *   Refine the Frontend UI: Polish the Dashboard, Settings page, and Trade History views.
    *   Implement UI toggles for Risk Management settings.
*   **Week 11**: 
    *   Containerize the FastAPI backend with Docker.
    *   Deploy the backend to Google Cloud Run. Ensure it handles WebSocket scaling.

---

### Phase 4: Launch & Monitor (Days 81 - 90)
**Goal:** Final security checks and public beta launch.

*   **Week 12**: 
    *   Add Legal Disclaimers to the UI.
    *   Set up Google Cloud Monitoring (Alerts if latency spikes or error rates increase).
    *   Invite 5 beta testers to register, plug in their API keys, and start using the platform.
