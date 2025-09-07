import os
from typing import List
import logging

from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

logger = logging.getLogger(__name__)

class HealthcareEmbeddings:    
    def __init__(self, model_name: str = "text-embedding-ada-002"):
        self.embeddings = OpenAIEmbeddings(model=model_name)
        self.vector_store = None
        self.vector_store_path = "../data/chroma_db"
    
    def create_vector_store(self, documents: List[Document]) -> bool:
        try:
            if not documents:
                logger.error("No documents provided for vector store creation")
                return False
            
            # Create Chroma vector store
            self.vector_store = Chroma.from_documents(
                documents, 
                self.embeddings,
                persist_directory=self.vector_store_path
            )
            
            # Chroma automatically persists
            logger.info(f"Vector store created with {len(documents)} documents")
            return True
            
        except Exception as e:
            logger.error(f"Error creating vector store: {e}")
            logger.error("Common causes: 1) Missing OPENAI_API_KEY, 2) Network issues, 3) ChromaDB installation issues")
            return False
    
    def load_vector_store(self) -> bool:
        try:
            if os.path.exists(self.vector_store_path):
                self.vector_store = Chroma(
                    persist_directory=self.vector_store_path,
                    embedding_function=self.embeddings
                )
                logger.info("Vector store loaded successfully")
                return True
            else:
                logger.warning("No existing vector store found")
                return False
                
        except Exception as e:
            logger.error(f"Error loading vector store: {e}")
            return False
    
    def add_documents(self, documents: List[Document]) -> bool:
        try:
            if self.vector_store is None:
                logger.error("Vector store not initialized")
                return False
            
            # Add documents to vector store
            self.vector_store.add_documents(documents)
            
            # Chroma automatically persists
            logger.info(f"Added {len(documents)} documents to vector store")
            return True
            
        except Exception as e:
            logger.error(f"Error adding documents to vector store: {e}")
            return False
    
    def similarity_search(self, query: str, k: int = 5) -> List[Document]:
        try:
            if self.vector_store is None:
                logger.error("Vector store not initialized")
                return []
            
            results = self.vector_store.similarity_search(query, k=k)
            logger.info(f"Found {len(results)} similar documents for query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Error performing similarity search: {e}")
            return []
    
    def similarity_search_with_score(self, query: str, k: int = 5) -> List[tuple]:
        try:
            if self.vector_store is None:
                logger.error("Vector store not initialized")
                return []
            
            results = self.vector_store.similarity_search_with_score(query, k=k)
            logger.info(f"Found {len(results)} similar documents with scores for query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Error performing similarity search with scores: {e}")
            return []
    
    def get_retriever(self, search_kwargs: dict = None):
        if self.vector_store is None:
            logger.error("Vector store not initialized")
            return None
        
        if search_kwargs is None:
            search_kwargs = {"k": 5}
        
        return self.vector_store.as_retriever(search_kwargs=search_kwargs)
