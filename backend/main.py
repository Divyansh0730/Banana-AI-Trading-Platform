from fastapi import FastAPI, WebSocket, Depends, status
import asyncio
import json
from datetime import datetime
import websockets
import os
from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session
from typing import List, Optional
import database
import models

# Set of supported assets for AI Trading
SUPPORTED_ASSETS = {"BTC/USDT", "ETH/USDT", "SOL/USDT"}
USDT_INR_RATE = 83.5
RISK_MULTIPLIERS = {
    "Conservative": 0.01,
    "Moderate": 0.02,
    "Aggressive": 0.03,
}

# Load environment variables
load_dotenv()

# Configure Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)

# Initialize DB tables
models.Base.metadata.create_all(bind=database.engine)

from fastapi.middleware.cors import CORSMiddleware

from routers import auth_router, settings_router
import auth

app = FastAPI(title="Banana AI Trading Engine")

# Add CORS middleware to fix the "Failed to fetch" error
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(settings_router.router)

def normalize_signal(raw_signal: dict) -> dict:
    action = str(raw_signal.get("action", "")).strip().upper()
    asset = str(raw_signal.get("asset", "")).strip().upper()
    reason = str(raw_signal.get("reason", "No reasoning supplied.")).strip()

    if action not in {"BUY", "SELL"}:
        raise ValueError("AI signal action must be BUY or SELL.")
    if asset not in SUPPORTED_ASSETS:
        raise ValueError(f"AI signal asset is not supported: {asset}")

    return {
        "action": action,
        "asset": asset,
        "target_profit": float(raw_signal.get("target_profit", 0.0)),
        "max_loss": float(raw_signal.get("max_loss", 0.0)),
        "time_horizon": str(raw_signal.get("time_horizon", "Intraday")),
        "confidence": float(raw_signal.get("confidence", 80.0)),
        "reason": reason[:500],
    }

def get_or_create_settings(db: Session, user_id: str) -> models.UserSettings:
    settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == user_id).first()
    if settings:
        return settings

    settings = models.UserSettings(user_id=user_id)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings

def cap_trade_amount(signal_amount: float, user_balance: float, settings: models.UserSettings) -> float:
    max_position_size = settings.max_position_size or 100000.0
    risk_pct = RISK_MULTIPLIERS.get(settings.risk_tolerance or "Moderate", RISK_MULTIPLIERS["Moderate"])
    risk_cap = max(user_balance, 0.0) * risk_pct
    return max(0.0, min(signal_amount, max_position_size, risk_cap, user_balance))

# Seed initial user if not exists
def get_or_create_user(db: Session):
    user = db.query(models.User).first()
    if not user:
        user = models.User(email="admin@banana.ai", hashed_password="password")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    get_or_create_user(db)
    db.close()

@app.get("/")
def read_root():
    return {"status": "online", "message": "Welcome to Banana AI Trading API"}

from routers.auth_router import get_current_user

@app.get("/api/v1/portfolio")
def get_portfolio(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Count open positions
    open_positions = db.query(models.Position).filter(models.Position.user_id == current_user.id, models.Position.quantity > 0).count()
    return {
        "balance": current_user.balance,
        "currency": "INR",
        "open_positions": open_positions
    }

@app.get("/api/v1/positions")
def get_positions(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    positions = db.query(models.Position).filter(models.Position.user_id == current_user.id, models.Position.quantity > 0).all()
    return [
        {
            "asset": p.asset,
            "quantity": p.quantity,
            "average_entry_price": p.average_entry_price
        } for p in positions
    ]

@app.get("/api/v1/trades")
def get_trades(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    trades = db.query(models.Trade).filter(models.Trade.user_id == current_user.id).order_by(models.Trade.created_at.desc()).limit(20).all()
    return [
        {
            "id": t.id,
            "asset": t.symbol,
            "type": t.side,
            "price": float(t.entry_price) if t.entry_price else 0,
            "qty": float(t.quantity) if t.quantity else 0,
            "time": t.created_at.strftime("%H:%M:%S") if t.created_at else "",
            "pnl": f"+{float(t.pnl):.0f}" if t.pnl and float(t.pnl) >= 0 else f"{float(t.pnl):.0f}" if t.pnl else "+0"
        } for t in trades
    ]

@app.get("/api/v1/stats")
def get_stats(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """Compute real portfolio statistics from user's trade history."""
    trades = db.query(models.Trade).filter(models.Trade.user_id == current_user.id).all()
    
    initial_balance = 2000000.0  # Default starting balance
    current_balance = current_user.balance
    
    total_trades = len(trades)
    buy_trades = sum(1 for t in trades if t.side == "BUY")
    sell_trades = sum(1 for t in trades if t.side == "SELL")
    
    # ROI calculation
    roi = ((current_balance - initial_balance) / initial_balance) * 100 if initial_balance > 0 else 0
    
    # Win rate (simplified: sells that resulted in profit)
    winning_trades = sum(1 for t in trades if t.pnl and float(t.pnl) > 0)
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    
    # Best asset by trade frequency
    asset_counts = {}
    for t in trades:
        asset_counts[t.symbol] = asset_counts.get(t.symbol, 0) + 1
    best_asset = max(asset_counts, key=asset_counts.get) if asset_counts else "N/A"
    
    return {
        "roi": round(roi, 2),
        "win_rate": round(win_rate, 1),
        "best_asset": best_asset,
        "total_trades": total_trades,
        "buy_trades": buy_trades,
        "sell_trades": sell_trades,
        "current_balance": current_balance,
        "initial_balance": initial_balance
    }

# API Endpoints
@app.post("/api/v1/wallet/refresh")
def refresh_wallet(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """Reset the dummy paper trading wallet to 2,00,000 INR."""
    current_user.balance = 2000000.0
    db.commit()
    return {"status": "success", "balance": current_user.balance, "message": "Dummy wallet refreshed to ₹2,00,000"}

from pydantic import BaseModel
class TradeRequest(BaseModel):
    asset: str
    action: str
    amount: float
    ai_signal_id: Optional[str] = None

@app.post("/api/v1/trade/execute")
def execute_trade(trade_req: TradeRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """Manually execute a paper trade based on an AI signal or manual decision."""
    # Simplified mock execution for MVP Paper Trading
    if trade_req.amount <= 0:
        raise ValueError("Trade amount must be positive.")
    if trade_req.action.upper() not in {"BUY", "SELL"}:
        raise ValueError("Invalid action.")

    # In a real scenario, fetch live price from Redis or Upstox API
    # Mocking price for now based on asset
    mock_prices = {
        "RELIANCE.NSE": 2850.50,
        "TCS.NSE": 3980.00,
        "INFY.NSE": 1450.25,
        "HDFCBANK.NSE": 1520.10,
    }
    current_price = mock_prices.get(trade_req.asset.upper(), 1000.0)
    qty = trade_req.amount / current_price

    position = db.query(models.Position).filter(
        models.Position.user_id == current_user.id, 
        models.Position.asset == trade_req.asset.upper()
    ).first()

    if not position:
        position = models.Position(user_id=current_user.id, asset=trade_req.asset.upper(), quantity=0.0, average_entry_price=0.0)
        db.add(position)

    if trade_req.action.upper() == "BUY":
        if current_user.balance < trade_req.amount:
            return {"status": "error", "message": "Insufficient dummy balance."}
        
        current_user.balance -= trade_req.amount
        total_cost = (position.quantity * position.average_entry_price) + trade_req.amount
        position.quantity += qty
        position.average_entry_price = total_cost / position.quantity
    elif trade_req.action.upper() == "SELL":
        # Simplified: Check if enough quantity
        if position.quantity < qty:
            return {"status": "error", "message": "Insufficient position quantity to sell."}
        
        current_user.balance += trade_req.amount
        position.quantity -= qty

    trade = models.Trade(
        user_id=current_user.id,
        asset_class="EQUITY",
        symbol=trade_req.asset.upper(),
        side=trade_req.action.upper(),
        quantity=qty,
        entry_price=current_price,
        ai_reason=f"Manual execution from AI Signal {trade_req.ai_signal_id}" if trade_req.ai_signal_id else "Manual Paper Trade"
    )
    db.add(trade)
    db.commit()

    return {"status": "success", "message": f"Successfully {trade_req.action} {qty:.4f} of {trade_req.asset}", "new_balance": current_user.balance}

@app.websocket("/ws/market")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    await websocket.accept()
    
    db = database.SessionLocal()
    try:
        if token:
            payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
            email = payload.get("sub")
            user = db.query(models.User).filter(models.User.email == email).first()
        else:
            user = None
    except Exception:
        user = None
    finally:
        db.close()

    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    latest_prices = {}
    
    # Binance streaming URL for multiple tickers
    binance_ws_url = "wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/solusdt@ticker"
    
    async def ai_brain_task():
        while True:
            await asyncio.sleep(20) # Generate signal every 20 seconds
            if not latest_prices:
                continue
                
            prompt = f"Act as an expert professional trader. Analyze these current stock prices in INR: {json.dumps(latest_prices)}. Generate a single trading signal for one of the assets. Return ONLY a valid JSON object (no markdown) with this structure: {{\"action\": \"Buy\" or \"Sell\", \"asset\": \"asset name\", \"target_profit\": 5.0, \"max_loss\": 2.0, \"time_horizon\": \"Intraday\", \"confidence\": 92.5, \"reason\": \"a short analytical reason\"}}"
            
            db = database.SessionLocal()
            try:
                db_user = db.query(models.User).filter(models.User.id == user.id).first()
                if not db_user:
                    return
                settings = get_or_create_settings(db, db_user.id)
                
                # Fetch dynamically saved API key from settings
                active_api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")
                
                try:
                    if not active_api_key:
                        raise Exception("No Gemini client configured, falling back to mock")
                    
                    local_client = genai.Client(api_key=active_api_key)
                    model = await asyncio.to_thread(
                        local_client.models.generate_content,
                        model="gemini-2.5-flash",
                        contents=prompt
                    )
                    signal_text = model.text
                except Exception as e:
                    import random
                    action = random.choice(["BUY", "SELL"])
                    asset = random.choice(list(SUPPORTED_ASSETS))
                    signal_text = f"""
                    {{
                        "action": "{action}",
                        "asset": "{asset}",
                        "target_profit": {random.uniform(2.0, 10.0):.2f},
                        "max_loss": {random.uniform(1.0, 3.0):.2f},
                        "time_horizon": "1-Week",
                        "confidence": {random.uniform(70.0, 99.0):.2f},
                        "reason": "System fallback: Algorithmic {action} signal generated due to AI API quota limits."
                    }}
                    """
                    
                try:
                    clean_json = signal_text.replace("```json", "").replace("```", "").strip()
                    signal = normalize_signal(json.loads(clean_json))
                except Exception as parse_err:
                    print("Rejected malformed AI signal:", parse_err)
                    continue

                if getattr(settings, 'kill_switch_active', False):
                    signal["reason"] = "TRADE ADVISORY BLOCKED: Kill Switch is active."

                # Save the AI Signal to DB (No automatic execution)
                ai_signal_record = models.AiSignal(
                    symbol=signal["asset"],
                    asset_class="EQUITY",
                    signal_type=signal["action"].upper(),
                    confidence_score=signal["confidence"],
                    target_profit_percent=signal["target_profit"],
                    max_loss_percent=signal["max_loss"],
                    time_horizon=signal["time_horizon"],
                    ai_model_used="gemini_pro",
                    reasoning=signal["reason"]
                )
                db.add(ai_signal_record)
                db.commit()
                db.refresh(ai_signal_record)
                
                current_balance = float(db_user.balance or 0.0)
                
            except Exception as db_err:
                print("DB Error processing signal:", db_err)
                current_balance = float(getattr(user, "balance", 0.0) or 0.0)
            finally:
                db.close()
                
                tick = {
                    "event": "ai_signal",
                    "timestamp": datetime.now().isoformat(),
                    "data": {
                        "id": str(ai_signal_record.id) if 'ai_signal_record' in locals() else "",
                        **signal
                    }
                }
                await websocket.send_text(json.dumps(tick))

    # Start the AI brain background task
    ai_task = asyncio.create_task(ai_brain_task())
    
    import redis.asyncio as redis_async
    
    try:
        redis_client = redis_async.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))
        pubsub = redis_client.pubsub()
        await pubsub.subscribe("market_ticks")
        
        while True:
            # Poll Redis for new ticks from the Rust Engine
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=0.1)
            if message and message["type"] == "message":
                tick_data = json.loads(message["data"])
                symbol = tick_data.get("symbol")
                price = tick_data.get("price")
                
                # Always update internal price tracker (for AI brain)
                latest_prices[symbol] = price
                
                # Stream directly to Next.js Frontend with NO artificial throttle (Zero Delay)
                tick = {
                    "event": "price_update",
                    "timestamp": tick_data.get("timestamp", datetime.now().isoformat()),
                    "data": {
                        "symbol": symbol,
                        "price": price,
                        "volume": tick_data.get("volume", 0)
                    }
                }
                
                try:
                    await websocket.send_text(json.dumps(tick))
                except Exception as send_err:
                    print(f"Client disconnected or send error: {repr(send_err)}", flush=True)
                    break
                    
            await asyncio.sleep(0.001) # Yield to event loop to maintain responsiveness
            
    except Exception as e:
        print(f"Redis Sub Error: {repr(e)}", flush=True)
    finally:
        ai_task.cancel()
        if 'pubsub' in locals():
            await pubsub.unsubscribe("market_ticks")
        if 'redis_client' in locals():
            await redis_client.aclose()
