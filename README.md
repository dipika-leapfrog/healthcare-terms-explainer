# Healthcare Terms & Processes Explainer

A comprehensive healthcare terminology and processes explainer built with LangChain and RAG architecture.

## Project Overview

This project helps users understand US healthcare terms and processes by leveraging Retrieval-Augmented Generation (RAG) to provide accurate, source-attributed answers from official healthcare documents.

## Architecture

- **Backend**: Python with LangChain, FastAPI
- **Frontend**: React application
- **Vector Database**: ChromaDB for document embeddings
- **LLM**: OpenAI GPT models
- **Documents**: CMS publications, HCPCS codes, HIPAA guides

## Features

### ✅ Basic Features

- Data ingestion from healthcare documents
- Document chunking and preprocessing
- Embeddings and vector database storage
- Retrieval QA chain
- Basic Q&A interface

### ✨ Advanced Features (Good-to-Have)

- Glossary mode
- Comparison mode
- Simplified vs technical answers
- Upload mode for custom documents

## Quick Start

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your OpenAI API key
```

4. Run the backend:

```bash
python src/main.py
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

## Environment Variables

Create a `.env` file in the backend directory:

```
OPENAI_API_KEY=your_openai_api_key_here
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=healthcare-explainer
```

## Data Sources

Place healthcare documents in the `data/` directory:

- HCPCS Level II Code Set PDFs
- HIPAA 837/835 transaction guides
- Medicare DME manuals
- CMS publications
