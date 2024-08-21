from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from ..database import get_db
from ..models import Entity, Connection
from ..auth import get_current_user
import networkx as nx

router = APIRouter()

def get_entity_connections(db: Session, entity_id: int, depth: int = 1, min_amount: float = 0):
    if depth <= 0:
        return [], []

    connections = db.query(Connection).filter(
        ((Connection.source_id == entity_id) | (Connection.target_id == entity_id)) &
        (Connection.amount >= min_amount)
    ).all()

    nodes = {entity_id: db.query(Entity).get(entity_id)}
    links = []

    for conn in connections:
        related_id = conn.target_id if conn.source_id == entity_id else conn.source_id
        if related_id not in nodes:
            nodes[related_id] = db.query(Entity).get(related_id)
        links.append(conn)

        if depth > 1:
            sub_nodes, sub_links = get_entity_connections(db, related_id, depth - 1, min_amount)
            for node in sub_nodes:
                if node.id not in nodes:
                    nodes[node.id] = node
            links.extend(sub_links)

    return list(nodes.values()), links

@router.get("/entity-relationships")
async def get_entity_relationships(
    entity_id: int,
    depth: int = Query(1, ge=1, le=3),
    min_amount: float = Query(0, ge=0),
    relationship_types: Optional[List[str]] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    nodes, links = get_entity_connections(db, entity_id, depth, min_amount)

    if relationship_types:
        links = [link for link in links if link.type in relationship_types]

    if search:
        search_lower = search.lower()
        nodes = [node for node in nodes if search_lower in node.name.lower()]
        node_ids = {node.id for node in nodes}
        links = [link for link in links if link.source_id in node_ids and link.target_id in node_ids]

    node_data = [
        {
            'id': node.id,
            'name': node.name,
            'type': node.type,
            'risk_score': node.risk_score,
        } for node in nodes
    ]

    link_data = [
        {
            'source': link.source_id,
            'target': link.target_id,
            'type': link.type,
            'amount': link.amount,
        } for link in links
    ]

    return {
        'nodes': node_data,
        'links': link_data
    }
