from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import NetworkView
from ..auth import get_current_user
import json

router = APIRouter()

@router.post("/save-network-view")
async def save_network_view(
    view_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_view = NetworkView(
        user_id=current_user.id,
        name=view_data.get('name', 'Unnamed View'),
        data=json.dumps(view_data)
    )
    db.add(new_view)
    db.commit()
    return {"message": "Network view saved successfully", "id": new_view.id}

@router.get("/network-views")
async def get_network_views(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    views = db.query(NetworkView).filter(NetworkView.user_id == current_user.id).all()
    return [{"id": view.id, "name": view.name} for view in views]

@router.get("/network-view/{view_id}")
async def get_network_view(
    view_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    view = db.query(NetworkView).filter(NetworkView.id == view_id, NetworkView.user_id == current_user.id).first()
    if not view:
        raise HTTPException(status_code=404, detail="Network view not found")
    return json.loads(view.data)
