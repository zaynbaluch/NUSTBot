"""
Configuration constants for the NUST Admissions Chatbot backend.
"""
import os
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent  # NUSTBot/
DATA_DIR = PROJECT_ROOT / "Data"
CHROMA_PERSIST_DIR = PROJECT_ROOT / "backend" / "chroma_db"
BM25_INDEX_PATH = PROJECT_ROOT / "backend" / "bm25_index.pkl"

# ── Ollama Models ──────────────────────────────────────────────────────
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.2")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")

# ── Cross-Encoder Reranker ─────────────────────────────────────────────
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"

# ── Chunking ───────────────────────────────────────────────────────────
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

# ── Retrieval ──────────────────────────────────────────────────────────
VECTOR_TOP_K = 10          # Top-K results from vector search
BM25_TOP_K = 10            # Top-K results from BM25 search
RERANK_TOP_K = 3           # Final top-K after reranking
RRF_K = 60                 # Reciprocal Rank Fusion constant

# ── ChromaDB ───────────────────────────────────────────────────────────
COLLECTION_NAME = "nust_admissions"
