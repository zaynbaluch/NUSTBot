"""
Hybrid Retriever: Vector Search (ChromaDB) + Keyword Search (BM25)
with Reciprocal Rank Fusion and Cross-Encoder Reranking.
"""
import logging
import re
from sentence_transformers import CrossEncoder

from app.config import (
    VECTOR_TOP_K, BM25_TOP_K, RERANK_TOP_K,
    RRF_K, RERANKER_MODEL,
)
from app.ingest import load_vector_store, load_bm25_index

logger = logging.getLogger(__name__)

# ── Global instances (lazy-loaded) ────────────────────────────────────
_vector_store = None
_bm25_index = None
_bm25_chunks = None
_reranker = None


def _get_vector_store():
    global _vector_store
    if _vector_store is None:
        _vector_store = load_vector_store()
    return _vector_store


def _get_bm25():
    global _bm25_index, _bm25_chunks
    if _bm25_index is None:
        _bm25_index, _bm25_chunks = load_bm25_index()
    return _bm25_index, _bm25_chunks


def _get_reranker():
    global _reranker
    if _reranker is None:
        logger.info(f"Loading reranker model: {RERANKER_MODEL}")
        _reranker = CrossEncoder(RERANKER_MODEL)
    return _reranker


def _tokenize(text: str) -> list[str]:
    """Simple tokenizer matching the ingestion tokenizer."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return text.split()


def vector_search(query: str, top_k: int = VECTOR_TOP_K) -> list[dict]:
    """Semantic search via ChromaDB embeddings."""
    vs = _get_vector_store()
    results = vs.similarity_search_with_relevance_scores(query, k=top_k)

    return [
        {
            "content": doc.page_content,
            "metadata": doc.metadata,
            "score": score,
            "source": "vector",
        }
        for doc, score in results
    ]


def bm25_search(query: str, top_k: int = BM25_TOP_K) -> list[dict]:
    """Keyword search via BM25 (great for acronyms and exact terms)."""
    bm25, chunks = _get_bm25()
    tokenized_query = _tokenize(query)
    scores = bm25.get_scores(tokenized_query)

    # Get top-k indices
    top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]

    return [
        {
            "content": chunks[i].page_content,
            "metadata": chunks[i].metadata,
            "score": float(scores[i]),
            "source": "bm25",
        }
        for i in top_indices
        if scores[i] > 0
    ]


def reciprocal_rank_fusion(
    vector_results: list[dict],
    bm25_results: list[dict],
    k: int = RRF_K,
) -> list[dict]:
    """
    Merge two ranked lists using Reciprocal Rank Fusion (RRF).
    Score = sum(1 / (k + rank)) for each list the doc appears in.
    """
    doc_scores: dict[str, float] = {}
    doc_map: dict[str, dict] = {}

    for rank, result in enumerate(vector_results):
        key = result["content"][:100]  # Use first 100 chars as dedup key
        doc_scores[key] = doc_scores.get(key, 0) + 1.0 / (k + rank + 1)
        doc_map[key] = result

    for rank, result in enumerate(bm25_results):
        key = result["content"][:100]
        doc_scores[key] = doc_scores.get(key, 0) + 1.0 / (k + rank + 1)
        if key not in doc_map:
            doc_map[key] = result

    # Sort by fused score
    sorted_keys = sorted(doc_scores, key=doc_scores.get, reverse=True)

    fused = []
    for key in sorted_keys:
        item = doc_map[key].copy()
        item["rrf_score"] = doc_scores[key]
        fused.append(item)

    return fused


def rerank(query: str, candidates: list[dict], top_k: int = RERANK_TOP_K) -> list[dict]:
    """
    Rerank candidates using a Cross-Encoder model.
    Returns the top-k most relevant results with confidence scores.
    """
    if not candidates:
        return []

    reranker = _get_reranker()

    # Prepare pairs for the cross-encoder
    pairs = [(query, c["content"]) for c in candidates]
    scores = reranker.predict(pairs)

    # Attach scores and sort
    for i, score in enumerate(scores):
        candidates[i]["rerank_score"] = float(score)

    reranked = sorted(candidates, key=lambda x: x["rerank_score"], reverse=True)
    return reranked[:top_k]


def hybrid_retrieve(query: str) -> tuple[list[dict], float]:
    """
    Full hybrid retrieval pipeline:
    1. Vector search (semantic)
    2. BM25 search (keyword)
    3. Reciprocal Rank Fusion
    4. Cross-Encoder Reranking → top 3

    Returns (top_chunks, confidence_score).
    """
    logger.info(f"Hybrid retrieval for: {query[:80]}...")

    # Step 1: Parallel retrieval
    vec_results = vector_search(query)
    bm25_results = bm25_search(query)

    logger.info(f"Vector: {len(vec_results)} results, BM25: {len(bm25_results)} results")

    # Step 2: Reciprocal Rank Fusion
    fused = reciprocal_rank_fusion(vec_results, bm25_results)
    logger.info(f"RRF fused: {len(fused)} unique candidates")

    # Step 3: Cross-Encoder Reranking
    top_chunks = rerank(query, fused)

    # Step 4: Calculate confidence score (0-100%)
    if top_chunks:
        # Map reranker scores (typically -10 to +10) to 0-100%
        raw_scores = [c["rerank_score"] for c in top_chunks]
        avg_score = sum(raw_scores) / len(raw_scores)
        # Sigmoid-like mapping for cross-encoder scores
        import math
        confidence = 1 / (1 + math.exp(-avg_score)) * 100
        confidence = min(99, max(10, confidence))  # Clamp to 10-99%
    else:
        confidence = 0.0

    logger.info(f"Top {len(top_chunks)} chunks, confidence: {confidence:.1f}%")
    return top_chunks, confidence


def reload_indices():
    """Force reload of all indices (after re-ingestion)."""
    global _vector_store, _bm25_index, _bm25_chunks
    _vector_store = None
    _bm25_index = None
    _bm25_chunks = None
    logger.info("Indices cleared — will reload on next query")
