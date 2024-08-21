from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Entity, Connection
from ..auth import get_current_user
import networkx as nx

router = APIRouter()

def create_graph(nodes, links):
    G = nx.Graph()
    for node in nodes:
        G.add_node(node['id'], **node)
    for link in links:
        G.add_edge(link['source'], link['target'], **link)
    return G

@router.get("/network-analytics")
async def get_network_analytics(
    entity_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    nodes, links = get_entity_connections(db, entity_id, depth=2)
    G = create_graph(nodes, links)

    analytics = {
        'centrality': {
            'degree': nx.degree_centrality(G),
            'betweenness': nx.betweenness_centrality(G),
            'eigenvector': nx.eigenvector_centrality(G)
        },
        'communities': list(nx.community.greedy_modularity_communities(G)),
        'average_clustering': nx.average_clustering(G),
        'network_density': nx.density(G)
    }

    return analytics
