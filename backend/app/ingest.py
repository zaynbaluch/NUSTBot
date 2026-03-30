"""
Document ingestion pipeline: loads PDFs and TXT files, chunks them,
creates ChromaDB vector store and BM25 keyword index.
"""
import pickle
import re
import logging
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from rank_bm25 import BM25Okapi

from app.config import (
    DATA_DIR, CHROMA_PERSIST_DIR, BM25_INDEX_PATH,
    OLLAMA_BASE_URL, EMBEDDING_MODEL,
    CHUNK_SIZE, CHUNK_OVERLAP, COLLECTION_NAME,
)

logger = logging.getLogger(__name__)


def load_documents() -> list:
    """Load all documents from the Data directory."""
    docs = []
    data_path = Path(DATA_DIR)

    for file_path in data_path.iterdir():
        if file_path.suffix.lower() == ".pdf":
            logger.info(f"Loading PDF: {file_path.name}")
            loader = PyPDFLoader(str(file_path))
            loaded = loader.load()
            for doc in loaded:
                doc.metadata["source"] = file_path.name
                doc.metadata["type"] = "pdf"
            docs.extend(loaded)

        elif file_path.suffix.lower() == ".txt":
            logger.info(f"Loading TXT: {file_path.name}")
            loader = TextLoader(str(file_path), encoding="utf-8")
            loaded = loader.load()
            for doc in loaded:
                doc.metadata["source"] = file_path.name
                doc.metadata["type"] = "txt"
            docs.extend(loaded)

    logger.info(f"Loaded {len(docs)} raw documents")
    return docs


def chunk_documents(docs: list) -> list:
    """Split documents into smaller chunks for retrieval."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(docs)
    logger.info(f"Created {len(chunks)} chunks")
    return chunks


def build_vector_store(chunks: list) -> Chroma:
    """Create/replace ChromaDB collection with embedded chunks."""
    embeddings = OllamaEmbeddings(
        model=EMBEDDING_MODEL,
        base_url=OLLAMA_BASE_URL,
    )

    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=str(CHROMA_PERSIST_DIR),
    )
    logger.info(f"Vector store created at {CHROMA_PERSIST_DIR}")
    return vector_store


def build_bm25_index(chunks: list) -> BM25Okapi:
    """Build BM25 keyword index over chunk texts and save to disk."""
    tokenized = [_tokenize(chunk.page_content) for chunk in chunks]
    bm25 = BM25Okapi(tokenized)

    # Save BM25 index and chunk references
    with open(BM25_INDEX_PATH, "wb") as f:
        pickle.dump({"bm25": bm25, "chunks": chunks}, f)

    logger.info(f"BM25 index saved to {BM25_INDEX_PATH}")
    return bm25


def _tokenize(text: str) -> list[str]:
    """Simple whitespace + lowercased tokenizer for BM25."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return text.split()


def load_vector_store() -> Chroma:
    """Load an existing ChromaDB collection from disk."""
    embeddings = OllamaEmbeddings(
        model=EMBEDDING_MODEL,
        base_url=OLLAMA_BASE_URL,
    )
    return Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=str(CHROMA_PERSIST_DIR),
        embedding_function=embeddings,
    )


def load_bm25_index():
    """Load BM25 index and chunks from disk."""
    with open(BM25_INDEX_PATH, "rb") as f:
        data = pickle.load(f)
    return data["bm25"], data["chunks"]


def run_ingestion():
    """Full ingestion pipeline: load → chunk → embed → index."""
    logger.info("Starting document ingestion...")

    # Clean up existing stores
    import shutil
    if CHROMA_PERSIST_DIR.exists():
        shutil.rmtree(CHROMA_PERSIST_DIR)
    if BM25_INDEX_PATH.exists():
        BM25_INDEX_PATH.unlink()

    docs = load_documents()
    chunks = chunk_documents(docs)
    build_vector_store(chunks)
    build_bm25_index(chunks)

    logger.info(f"Ingestion complete: {len(chunks)} chunks indexed")
    return len(chunks)
