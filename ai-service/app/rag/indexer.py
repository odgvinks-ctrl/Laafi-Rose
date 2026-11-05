from uuid import uuid4

from qdrant_client.models import (
    PointStruct
)

from app.rag.embeddings import (
    create_embedding
)

from app.rag.qdrant_manager import (
    client
)

def index_chunks(chunks):

    points = []

    for chunk in chunks:

        vector = create_embedding(
            chunk["content"]
        )

        points.append(
            PointStruct(
                id=str(uuid4()),
                vector=vector,
                payload={
                    "text":
                    chunk["content"],

                    "source":
                    chunk["source"]
                }
            )
        )

    client.upsert(
        collection_name="laafi",
        wait=True,
        points=points
    )

    print(
        f"{len(points)} chunks indexés"
    )