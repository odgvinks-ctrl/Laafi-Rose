from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)


def split_text(
    text: str,
    source: str
):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=[
            "\n\n",
            "\n",
            ". ",
            " ",
            ""
        ]
    )

    chunks = splitter.split_text(text)

    return [
        {
            "content": chunk,
            "source": source
        }
        for chunk in chunks
    ]