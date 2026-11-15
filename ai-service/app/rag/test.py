# app/rag/test_retriever.py

from app.rag.retriever import retrieve


results = retrieve(
    "Quels sont les facteurs de risque du cancer du sein ?"
)

print(f"Résultats trouvés : {len(results)}")

for i, result in enumerate(results):

    print("\n====================")

    print(f"Résultat {i+1}")

    print(f"Score : {result.score}")

    print(result.payload["text"][:500])