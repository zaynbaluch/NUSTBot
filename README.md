# NUST Admissions Chatbot

A Hybrid RAG (Retrieval-Augmented Generation) chatbot designed to answer questions regarding admissions at the National University of Sciences and Technology (NUST), Pakistan.

The project features a sleek **Next.js frontend** and a **FastAPI backend** powered by local LLMs via Ollama. It utilizes a hybrid search approach (Vector + Keyword) with cross-encoder reranking to ensure highly accurate, context-aware, and helpful responses to prospective students.

## Features

- **Hybrid Retrieval**: Combines ChromaDB (Vector Search) and BM25 (Keyword Search) to retrieve the most relevant context.
- **Reranker**: Uses a Cross-Encoder model (`ms-marco-MiniLM-L-6-v2`) to accurately re-rank retrieved chunks.
- **Local LLMs**: Powered by Ollama (`llama3.2` for generation and `nomic-embed-text` for embeddings), ensuring complete data privacy.
- **Streaming Responses**: Fast, real-time response generation utilizing Server-Sent Events (SSE).
- **Responsive UI**: A modern interface built with Next.js, React, and Tailwind CSS.
- **Automatic Ingestion**: Automatically processes, chunks, and indexes admission documents placed in the `Data/` directory.

---

## Prerequisites

Before running the application, ensure you have the following installed on your system:

1. **Python 3.10+**
2. **Node.js 18+** & **pnpm**
3. **[Ollama](https://ollama.com/)** (Running locally in the background)

---

## Setup & Installation

### 1. Local Models Setup (Ollama)

Ensure Ollama is running, then pull the required models by opening a terminal and running:

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

### 2. Backend Setup

The backend handles the RAG pipeline, LLM interaction, and document ingestion.

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate 
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   python app/main.py
   ```
   *The backend will be available at `http://localhost:8000`. On its first launch, it will automatically scan the project root's `Data/` directory to ingest documents and build the Chroma and BM25 indices.*

### 3. Frontend Setup

The frontend provides the chat interface for students to interact with the bot.

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies using `pnpm`:
   ```bash
   pnpm install
   ```
3. Start the Next.js development server:
   ```bash
   pnpm dev
   ```
   *The frontend will now be available at `http://localhost:3000`.*

---

## Usage Guide

1. **Adding Knowledge**: Place your admissions data files (such as PDFs) inside the `Data/` directory located in the root of the project.
2. **Initial Ingestion**: When you start the backend using `python app/main.py` for the first time, it will automatically ingest these files.
3. **Re-Indexing**: If you add new documents later, you can POST to the `/api/ingest` endpoint on the backend (using tools like Postman or `curl`) to rebuild the indices.
4. **Chatting**: Open `http://localhost:3000` in your browser. Ask the chatbot questions related to NUST admissions. It is specially prompted to provide warm, encouraging, student-centric advice utilizing Pakistani terminology.

---

## Project Structure

```text
NUSTBot/
│
├── frontend/       # Next.js web application (UI)
├── backend/        # FastAPI server, Hybrid RAG pipeline
│   ├── app/        # Main application logic (ingestion, retrieval, llm generation)
│   ├── chroma_db/  # Persistent vector database 
│   ├── reqs.txt    # Python dependencies
│   └── ...
├── Data/           # Raw PDF documents containing NUST admission guidelines
└── README.md       # Project documentation (this file)
```
