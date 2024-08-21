from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Connection
from ..auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/time-based-network")
async def get_time_based_network(
    entity_id: int,
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    connections = db.query(Connection).filter(
        ((Connection.source_id == entity_id) | (Connection.target_id == entity_id)) &
        (Connection.timestamp.between(start_date, end_date))
    ).order_by(Connection.timestamp).all()

    time_slices = []
    current_slice = {'nodes': set(), 'links': []}
    for conn in connections:
        current_slice['nodes'].add(conn.source_id)
        current_slice['nodes'].add(conn.target_id)
        current_slice['links'].append({
            'source': conn.source_id,
            'target': conn.target_id,
            'amount': conn.amount,
            'type': conn.type,
            'timestamp': conn.timestamp.isoformat()
        })
        if len(current_slice['links']) >= 10:  # Create a new slice every 10 connections
            time_slices.append({
                'nodes': list(current_slice['nodes']),
                'links': current_slice['links'],
                'timestamp': current_slice['links'][-1]['timestamp']
            })
            current_slice = {'nodes': set(), 'links': []}

    if current_slice['links']:
        time_slices.append({
            'nodes': list(current_slice['nodes']),
            'links': current_slice['links'],
            'timestamp': current_slice['links'][-1]['timestamp']
        })

    return time_slices
