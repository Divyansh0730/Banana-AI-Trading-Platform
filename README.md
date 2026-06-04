# Banana AI Trading Platform 🍌🤖

An Expert-Level, Multi-Asset AI Trading Platform designed to execute trades across **Indian Equity (NSE/BSE)**, **Derivatives (F&O)**, **Global US Stocks**, and **Cryptocurrency**. It leverages Google Cloud's serverless infrastructure, Vertex AI for Reinforcement Learning (FinRL), and Google Gemini for macroeconomic reasoning.

## 🚀 Key Features

*   **Omni-Asset Support**: Trade Crypto, Stocks, Options, and Forex from a single dashboard.
*   **"Expert-Level" AI Agent**: Powered by Reinforcement Learning (PPO/A2C) trained on Vertex AI to maximize the Sharpe Ratio, mimicking institutional hedge funds.
*   **Gemini Market Sentiment**: Natural language explanations for every trade and automated halting during extreme macroeconomic fear events.
*   **Real-Time Execution**: Custom FastAPI backend connected to Google Cloud Pub/Sub for sub-100ms execution latency.
*   **Banana Trading Academy**: Built-in interactive modules to teach users how to optimize Risk Settings ("The Kill Switch") and understand the AI's logic.
*   **Dual Modes**: Fully functional "Paper Trading" simulation mode alongside real-money API execution.

## 🏗 Architecture & Stack

*   **Frontend**: Next.js 15, React, Tailwind CSS v4, Lucide Icons, Firebase Hosting.
*   **Backend Core**: Python (FastAPI), Google Cloud Run.
*   **Event Driven Engine**: Google Cloud Pub/Sub, WebSockets.
*   **Databases**: Supabase (PostgreSQL for strict relationals), Firebase Firestore (Realtime UI), Google BigQuery (Massive Tick/Option Chain Data Lake).
*   **AI/ML**: Vertex AI (Predictive ML), Google Gemini Pro API (Cognitive NLP).

## 📂 Project Structure
*   `/docs` - Contains the foundational PRD, SRS, Architecture, and AI Strategy blueprints.
*   `/frontend` - The Next.js Next-Gen Dashboard.
*   *(Backend engine coming soon)*

## ⚠️ Disclaimer
Trading carries significant financial risk. This software does not guarantee profits. Use the "Paper Trading" mode to test strategies before risking actual capital. Binary Options trading is explicitly NOT supported due to regulatory laws in India.
