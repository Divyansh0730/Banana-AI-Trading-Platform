# Software Requirements Specification (SRS)
## Product Name: Banana AI Trading Platform

### 1. Introduction
This document specifies the requirements for the Banana AI Trading Platform, engineered specifically to leverage Google Cloud's serverless infrastructure and AI tools to minimize costs while maximizing performance.

### 2. Functional Requirements

#### 2.1. Authentication & Security
*   **FR-1.1**: User registration and JWT authentication shall be handled by **Firebase Authentication**.
*   **FR-1.2**: Exchange API Keys (Binance/Bybit) must be encrypted using AES-256 before storage in Supabase PostgreSQL.

#### 2.2. Trading Engine & Event System
*   **FR-2.1**: The system shall ingest live WebSocket prices from exchanges and publish them to **Google Cloud Pub/Sub**.
*   **FR-2.2**: The **FastAPI** backend (on Cloud Run) shall subscribe to Pub/Sub to process ticks asynchronously.
*   **FR-2.3**: The system shall route "Paper Trades" to Firestore/BigQuery and "Live Trades" to the respective Exchange API.

#### 2.3. AI Processing Pipeline
*   **FR-3.1**: The system shall query a **Vertex AI Endpoint** (hosting a GRU/LSTM model) to retrieve buy/sell predictions.
*   **FR-3.2**: The system shall query the **Google Gemini API** to generate plain-text reasoning for trade signals.
*   **FR-3.3**: A **Google Cloud Function** shall trigger weekly to run a retraining pipeline in Vertex AI using historical data.

#### 2.4. Data Storage & Analytics
*   **FR-4.1**: Active user settings and current API keys shall be stored in **Supabase**.
*   **FR-4.2**: Real-time frontend dashboard state (active portfolio balance) shall sync via **Firebase Firestore**.
*   **FR-4.3**: Massive, immutable datasets (historical OHLCV ticks, all past trade logs) shall be appended to **Google BigQuery**.
*   **FR-4.4**: AI Model weights (`.h5` files) shall be stored in **Google Cloud Storage**.

#### 2.5. Notifications
*   **FR-5.1**: The system shall send trade execution confirmations and risk alerts to the user via a **Telegram Bot API**.

### 3. Non-Functional Requirements

#### 3.1. Cost Efficiency (Serverless)
*   **NFR-1.1**: The architecture must utilize "scale-to-zero" capabilities (Cloud Run, Cloud Functions) to ensure zero hosting costs during idle periods.

#### 3.2. Performance
*   **NFR-2.1**: Time from Pub/Sub event ingestion to Exchange order execution must be under 150 milliseconds.

#### 3.3. Compliance
*   **NFR-3.1**: The UI must display strict Risk Disclaimers.
*   **NFR-3.2**: The system shall strictly isolate tenant (user) API keys and never permit cross-account data leakage.

### 4. Core Technology Stack
*   **Frontend**: Next.js (React), Tailwind CSS, Firebase Hosting.
*   **Backend Server**: Python (FastAPI), Google Cloud Run.
*   **Event Bus**: Google Cloud Pub/Sub.
*   **Databases**: Firebase Firestore (Realtime UI), Supabase (Relational Config), BigQuery (Data Lake).
*   **AI Stack**: Vertex AI (Predictive ML), Google Gemini (Generative NLP).
*   **Task Scheduling**: Google Cloud Functions.
