from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas
import models
from database import get_db
from routers.auth_router import get_current_user

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])

@router.get("", response_model=schemas.UserSettingsResponse)
def get_settings(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = models.UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.post("", response_model=schemas.UserSettingsResponse)
def update_settings(settings_update: schemas.UserSettingsUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = models.UserSettings(user_id=current_user.id)
        db.add(settings)
    
    update_data = settings_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
        
    db.commit()
    db.refresh(settings)
    return settings
