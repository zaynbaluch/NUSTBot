"""
LLM module: Query expansion and streaming response generation via Ollama.
"""
import logging
from collections.abc import Generator

from langchain_ollama import ChatOllama

from app.config import OLLAMA_BASE_URL, LLM_MODEL
from app.prompts import SYSTEM_PROMPT, QUERY_EXPANSION_PROMPT

logger = logging.getLogger(__name__)

# ── Global LLM instance ───────────────────────────────────────────────
_llm = None


def _get_llm() -> ChatOllama:
    global _llm
    if _llm is None:
        _llm = ChatOllama(
            model=LLM_MODEL,
            base_url=OLLAMA_BASE_URL,
            temperature=0.3,
        )
    return _llm


def expand_query(user_query: str) -> str:
    """
    Use the LLM to expand the user's query:
    - Expand acronyms (CS → Computer Science, EE → Electrical Engineering)
    - Add synonyms and related terms
    """
    try:
        llm = _get_llm()
        prompt = QUERY_EXPANSION_PROMPT.format(query=user_query)
        response = llm.invoke(prompt)
        expanded = response.content.strip()
        logger.info(f"Query expanded: '{user_query}' → '{expanded[:100]}...'")
        return expanded
    except Exception as e:
        logger.warning(f"Query expansion failed: {e}. Using original query.")
        return user_query


def format_context(chunks: list[dict]) -> str:
    """Format retrieved chunks into context string for the prompt."""
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk.get("metadata", {}).get("source", "Unknown")
        page = chunk.get("metadata", {}).get("page", "")
        page_info = f" (Page {page + 1})" if isinstance(page, int) else ""
        context_parts.append(
            f"[Document {i} — Source: {source}{page_info}]\n{chunk['content']}"
        )
    return "\n\n---\n\n".join(context_parts)


def format_history(history: list[dict]) -> str:
    """Format conversation history for the prompt."""
    if not history:
        return "No previous conversation."

    # Keep only last 6 messages to manage context window
    recent = history[-6:]
    parts = []
    for msg in recent:
        role = "User" if msg["role"] == "user" else "Assistant"
        parts.append(f"{role}: {msg['content'][:300]}")
    return "\n".join(parts)


def stream_response(
    user_query: str,
    context_chunks: list[dict],
    history: list[dict],
) -> Generator[str, None, None]:
    """
    Stream LLM response token-by-token using Ollama.
    Yields individual text tokens.
    """
    llm = _get_llm()
    context = format_context(context_chunks)
    history_str = format_history(history)

    prompt = SYSTEM_PROMPT.format(
        context=context,
        history=history_str,
        question=user_query,
    )

    logger.info("Starting LLM streaming response...")

    for chunk in llm.stream(prompt):
        token = chunk.content
        if token:
            yield token


def generate_response(
    user_query: str,
    context_chunks: list[dict],
    history: list[dict],
) -> str:
    """Non-streaming response generation (for testing)."""
    tokens = list(stream_response(user_query, context_chunks, history))
    return "".join(tokens)
