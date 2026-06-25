"""Flock Alerts router — CRUD /api/flock-alerts"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import FlockAlert
from ..schemas import FlockAlertCreate, FlockAlertPatch, FlockAlertOut

router = APIRouter(prefix="/api/flock-alerts", tags=["flock-alerts"])


@router.get("", response_model=List[FlockAlertOut])
def get_alerts(buyer_id: str = "b1", db: Session = Depends(get_db)):
    return db.query(FlockAlert).filter(FlockAlert.buyer_id == buyer_id).all()


@router.post("", response_model=FlockAlertOut, status_code=201)
def create_alert(body: FlockAlertCreate, db: Session = Depends(get_db)):
    alert = FlockAlert(
        id=str(uuid.uuid4())[:8],
        buyer_id=body.buyer_id,
        category=body.category,
        radius_m=body.radius_m,
        after_time=body.after_time,
        target_price=body.target_price,
        auto_reserve=body.auto_reserve,
        active=True,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.patch("/{alert_id}", response_model=FlockAlertOut)
def patch_alert(alert_id: str, body: FlockAlertPatch, db: Session = Depends(get_db)):
    alert = db.query(FlockAlert).filter(FlockAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(alert, field, value)
    db.commit()
    db.refresh(alert)
    return alert


@router.delete("/{alert_id}", status_code=204)
def delete_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(FlockAlert).filter(FlockAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
