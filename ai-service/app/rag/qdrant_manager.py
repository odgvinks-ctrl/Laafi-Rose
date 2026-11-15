from qdrant_client import (
    QdrantClient
)

client = QdrantClient(
    host="localhost",
    port=6333
)

from qdrant_client.models import (
    VectorParams,
    Distance
)


def create_collection():

    client.recreate_collection(
        collection_name="laafi",

        vectors_config=VectorParams(
            size=384,
            distance=Distance.COSINE
        )
    )# app/rag/qdrant_manager.py

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams
)

client = QdrantClient(
    host="localhost",
    port=6333
)


def create_collection():

    collections = client.get_collections()

    existing = [
        c.name
        for c in collections.collections
    ]

    if "laafi" not in existing:

        client.create_collection(
            collection_name="laafi",
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE
            )
        )

        print("Collection créée")

    else:

        print("Collection déjà existante")