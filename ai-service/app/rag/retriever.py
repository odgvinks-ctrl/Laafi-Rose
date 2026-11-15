from app.rag.embeddings import create_embedding
from app.rag.qdrant_manager import client


def retrieve(query: str, limit: int = 5):

    query_vector = create_embedding(query)

    results = client.query_points(
        collection_name="laafi",
        query=query_vector,
        limit=limit
    )

    return results.points