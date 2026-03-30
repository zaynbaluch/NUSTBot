"""
FastAPI application — NUST Admissions Chatbot.
SSE streaming endpoint for real-time chat responses.
"""
import json
import logging
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel

from app.ingest import run_ingestion
from app.retriever import hybrid_retrieve, reload_indices
from app.llm import expand_query, stream_response

# ── Logging ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)s │ %(levelname)s │ %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ───────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run ingestion on startup if indices don't exist."""
    from app.config import CHROMA_PERSIST_DIR, BM25_INDEX_PATH

    if not CHROMA_PERSIST_DIR.exists() or not BM25_INDEX_PATH.exists():
        logger.info("No indices found — running initial ingestion...")
        run_ingestion()
    else:
        logger.info("Existing indices found — skipping ingestion.")

    yield  # App is running

    logger.info("Shutting down...")


# ── FastAPI App ────────────────────────────────────────────────────────
app = FastAPI(
    title="NUST Admissions Chatbot API",
    description="Hybrid RAG chatbot for NUST university admissions",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ──────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


# ── Endpoints ──────────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "NUST Admissions Chatbot"}


@app.post("/api/ingest")
async def ingest_documents():
    """Re-ingest all documents and rebuild indices."""
    try:
        num_chunks = run_ingestion()
        reload_indices()
        return {"status": "ok", "chunks_indexed": num_chunks}
    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        return {"status": "error", "detail": str(e)}


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    SSE streaming chat endpoint.
    Streams JSON events:
      - {"type": "status", "data": "thinking" | "searching" | "answering"}
      - {"type": "token", "data": "..."}
      - {"type": "sources", "data": [...]}
      - {"type": "confidence", "data": 85.5}
      - {"type": "done"}
    """
    user_message = request.message
    history = request.history

    async def event_generator():
        try:
            # ── Step 1: Query Expansion ──
            yield {
                "event": "message",
                "data": json.dumps({"type": "status", "data": "thinking"}),
            }
            await asyncio.sleep(0.1)

            expanded_query = await asyncio.to_thread(expand_query, user_message)

            # ── Step 2: Hybrid Retrieval ──
            yield {
                "event": "message",
                "data": json.dumps({"type": "status", "data": "searching"}),
            }
            await asyncio.sleep(0.1)

            chunks, confidence = await asyncio.to_thread(
                hybrid_retrieve, expanded_query
            )

            # ── Send confidence score ──
            yield {
                "event": "message",
                "data": json.dumps({
                    "type": "confidence",
                    "data": round(confidence, 1),
                }),
            }

            # ── Send sources ──
            sources = []
            seen = set()
            for chunk in chunks:
                meta = chunk.get("metadata", {})
                source_name = meta.get("source", "Unknown")
                if source_name not in seen:
                    seen.add(source_name)
                    page = meta.get("page", None)
                    sources.append({
                        "name": source_name,
                        "page": page + 1 if isinstance(page, int) else None,
                        "snippet": chunk["content"][:200],
                        "score": round(chunk.get("rerank_score", 0), 3),
                    })

            yield {
                "event": "message",
                "data": json.dumps({"type": "sources", "data": sources}),
            }

            # ── Step 3: Stream LLM Response ──
            yield {
                "event": "message",
                "data": json.dumps({"type": "status", "data": "answering"}),
            }
            await asyncio.sleep(0.1)

            # Stream tokens
            for token in stream_response(user_message, chunks, history):
                yield {
                    "event": "message",
                    "data": json.dumps({"type": "token", "data": token}),
                }
                await asyncio.sleep(0.01)  # Small delay for smooth streaming

            # ── Done ──
            yield {
                "event": "message",
                "data": json.dumps({"type": "done"}),
            }

        except Exception as e:
            logger.error(f"Chat error: {e}", exc_info=True)
            yield {
                "event": "message",
                "data": json.dumps({
                    "type": "error",
                    "data": "I'm sorry, I encountered an error. Please try again.",
                }),
            }

    return EventSourceResponse(event_generator())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
