from fastapi import FastAPI, WebSocket
import asyncio
import json
import random
from datetime import datetime

app = FastAPI(title="Banana AI Trading Engine")

@app.get("/")
def read_root():
    return {"status": "online", "message": "Welcome to Banana AI Trading API"}

@app.get("/api/v1/portfolio")
def get_portfolio():
    return {
        "balance": 24592.50,
        "currency": "USD",
        "open_positions": 3
    }

# Mock WebSocket to simulate live Binance/Zerodha Data
@app.websocket("/ws/market")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    assets = ["BTC/USDT", "NIFTY24MAY22000CE", "RELIANCE", "AAPL"]
    
    try:
        while True:
            # Generate random tick data to simulate live market
            tick = {
                "event": "price_update",
                "timestamp": datetime.now().isoformat(),
                "data": {
                    "symbol": random.choice(assets),
                    "price": round(random.uniform(100, 65000), 2),
                    "volume": round(random.uniform(1, 50), 2)
                }
            }
            await websocket.send_text(json.dumps(tick))
            await asyncio.sleep(1) # Send tick every second
    except Exception as e:
        print(f"WebSocket Error: {e}")
