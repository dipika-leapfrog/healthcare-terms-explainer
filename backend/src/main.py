from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from dotenv import load_dotenv

# Configure logging for the entire application
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from data_ingestion import DocumentProcessor
from retriever import HealthcareRetriever
from chains import HealthcareQAChain

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Healthcare Terms & Processes Explainer",
    description="AI-powered healthcare terminology and processes explainer using LangChain and RAG",
    version="1.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize components
document_processor = DocumentProcessor()
retriever = HealthcareRetriever()
qa_chain = HealthcareQAChain()

# Pydantic models for request/response
class QuestionRequest(BaseModel):
    question: str
    mode: Optional[str] = "standard"

class QuestionResponse(BaseModel):
    answer: str
    sources: List[str]
    mode: str

class ComparisonRequest(BaseModel):
    term1: str
    term2: str

class ComparisonResponse(BaseModel):
    comparison: str
    sources: List[str]

@app.get("/")
async def root():
    return {"message": "Healthcare Terms & Processes Explainer API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    try:
        # Process the question based on mode
        if request.mode == "glossary":
            result = qa_chain.get_definition(request.question)
        elif request.mode == "simple":
            result = qa_chain.get_simple_answer(request.question)
        elif request.mode == "technical":
            result = qa_chain.get_technical_answer(request.question)
        else:
            result = qa_chain.get_answer(request.question)
        
        return QuestionResponse(
            answer=result["answer"],
            sources=result["sources"],
            mode=request.mode
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare", response_model=ComparisonResponse)
async def compare_terms(request: ComparisonRequest):
    try:
        result = qa_chain.compare_terms(request.term1, request.term2)
        return ComparisonResponse(
            comparison=result["comparison"],
            sources=result["sources"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        file_path = f"../data/uploaded_{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Process the document
        success = document_processor.process_document(file_path)
        
        if success:
            return {"message": f"Document {file.filename} processed successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to process document")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents():
    try:
        documents = document_processor.list_documents()
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/initialize")
async def initialize_system():
    try:
        # Initialize with sample data
        await document_processor.initialize_sample_data()
        await retriever.initialize()
        
        return {"message": "System initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
