import pymupdf


def load_pdf(pdf_path):

    try:

        document = pymupdf.open(pdf_path)

        text = ""

        for page in document:
            text += page.get_text()

        document.close()

        return text

    except Exception as e:

        raise Exception(
            f"Erreur lecture PDF : {e}"
        )