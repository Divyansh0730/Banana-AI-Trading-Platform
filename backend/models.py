from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import datetime
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    firebase_uid = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    subscription_tier = Column(String, default='free')
    balance = Column(Float, default=2000000.0) # Used for paper trading

class BrokerCredential(Base):
    __tablename__ = "broker_credentials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    broker_name = Column(String, nullable=False)
    api_key = Column(String)
    api_secret = Column(String)
    access_token = Column(String)
    refresh_token = Column(String)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Trade(Base):
    __tablename__ = "trades"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    broker_name = Column(String, default="paper_trading")
    asset_class = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    expiry_date = Column(DateTime, nullable=True)
    strike_price = Column(Numeric(18, 4), nullable=True)
    option_type = Column(String, nullable=True)
    side = Column(String, nullable=False)
    order_type = Column(String, default="MARKET")
    quantity = Column(Numeric(18, 8), nullable=False)
    entry_price = Column(Numeric(18, 8), nullable=False)
    exit_price = Column(Numeric(18, 8), nullable=True)
    status = Column(String, default="OPEN")
    pnl = Column(Numeric(18, 8), default=0.0)
    is_paper_trade = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    ai_reason = Column(String, nullable=True)

class AiSignal(Base):
    __tablename__ = "ai_signals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    symbol = Column(String, nullable=False)
    asset_class = Column(String, nullable=False)
    signal_type = Column(String, nullable=False) # e.g., 'BUY', 'SELL'
    confidence_score = Column(Numeric(5, 2), nullable=False)
    target_profit_percent = Column(Numeric(5, 2), nullable=True)
    max_loss_percent = Column(Numeric(5, 2), nullable=True) # Stop Loss
    time_horizon = Column(String, nullable=True) # e.g., 'Intraday', '1-Week', '1-Month'
    ai_model_used = Column(String, nullable=False)
    reasoning = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Position(Base):
    __tablename__ = "positions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    asset = Column(String, index=True)
    quantity = Column(Float, default=0.0)
    average_entry_price = Column(Float, default=0.0)

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    gemini_api_key = Column(String, nullable=True)
    risk_tolerance = Column(String, default="Moderate")
    max_position_size = Column(Float, default=100000.0)
    notify_trades = Column(Boolean, default=True)
    notify_market = Column(Boolean, default=True)
    notify_quota = Column(Boolean, default=True)
    kill_switch_active = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
