from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserSettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    risk_tolerance: Optional[str] = None
    max_position_size: Optional[float] = None
    notify_trades: Optional[bool] = None
    notify_market: Optional[bool] = None
    notify_quota: Optional[bool] = None
    kill_switch_active: Optional[bool] = None

class UserSettingsResponse(BaseModel):
    gemini_api_key: Optional[str]
    risk_tolerance: Optional[str]
    max_position_size: Optional[float]
    notify_trades: Optional[bool]
    notify_market: Optional[bool]
    notify_quota: Optional[bool]
    kill_switch_active: Optional[bool]

    class Config:
        from_attributes = True

class AiSignalResponse(BaseModel):
    id: str
    symbol: str
    asset_class: str
    signal_type: str
    confidence_score: float
    target_profit_percent: Optional[float] = None
    max_loss_percent: Optional[float] = None
    time_horizon: Optional[str] = None
    reasoning: Optional[str] = None

    class Config:
        from_attributes = True
