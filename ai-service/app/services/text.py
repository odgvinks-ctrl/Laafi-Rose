import re
import unicodedata


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in text if unicodedata.category(c) != "Mn")


def tokens(text: str) -> list[str]:
    return [t for t in re.findall(r"[a-z0-9]+", normalize(text)) if len(t) > 2]


def chunk(text: str, max_words: int = 120, overlap: int = 30) -> list[str]:
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks, current = [], []
    for p in paragraphs:
        words = p.split()
        if current and len(current) + len(words) > max_words:
            chunks.append(" ".join(current))
            current = current[-overlap:]
        current.extend(words)
        while len(current) > max_words:
            chunks.append(" ".join(current[:max_words]))
            current = current[max_words - overlap:]
    if current:
        chunks.append(" ".join(current))
    return chunks
