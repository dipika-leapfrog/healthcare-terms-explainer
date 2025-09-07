import logging
from typing import List, Dict, Any

from embeddings import HealthcareEmbeddings
from data_ingestion import DocumentProcessor

logger = logging.getLogger(__name__)

class HealthcareRetriever:    
    def __init__(self):
        self.embeddings = HealthcareEmbeddings()
        self.document_processor = DocumentProcessor()
        self.retriever = None
        self.initialized = False
        
        # Initialize with sample data immediately
        self.initialize_sync()
    
    def initialize_sync(self) -> bool:
        try:
            # Try to load existing vector store
            if self.embeddings.load_vector_store():
                self.retriever = self.embeddings.get_retriever({"k": 5})
                self.initialized = True
                logger.info("Retriever initialized with existing vector store")
                return True
            
            # If no vector store exists, create one with sample data
            self.document_processor.initialize_sample_data_sync()
            documents = self.document_processor.get_processed_documents()
            
            if documents:
                if self.embeddings.create_vector_store(documents):
                    self.retriever = self.embeddings.get_retriever({"k": 5})
                    self.initialized = True
                    logger.info("Retriever initialized with new vector store")
                    return True
            
            logger.error("Failed to initialize retriever")
            return False
            
        except Exception as e:
            logger.error(f"Error initializing retriever: {e}")
            return False
    
    async def initialize(self) -> bool:
        try:
            # Try to load existing vector store
            if self.embeddings.load_vector_store():
                self.retriever = self.embeddings.get_retriever({"k": 5})
                self.initialized = True
                logger.info("Retriever initialized with existing vector store")
                return True
            
            # If no vector store exists, create one with sample data
            await self.document_processor.initialize_sample_data()
            documents = self.document_processor.get_processed_documents()
            
            if documents:
                if self.embeddings.create_vector_store(documents):
                    self.retriever = self.embeddings.get_retriever({"k": 5})
                    self.initialized = True
                    logger.info("Retriever initialized with new vector store")
                    return True
            
            logger.error("Failed to initialize retriever")
            return False
            
        except Exception as e:
            logger.error(f"Error initializing retriever: {e}")
            return False
    
    def retrieve_documents(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        try:
            if not self.initialized or self.retriever is None:
                logger.error("Retriever not initialized")
                return []
            
            # Get relevant documents
            docs = self.retriever.get_relevant_documents(query)
            
            # Format results
            results = []
            for doc in docs:
                results.append({
                    "content": doc.page_content,
                    "source": doc.metadata.get("source", "Unknown"),
                    "document_type": doc.metadata.get("document_type", "Unknown")
                })
            
            logger.info(f"Retrieved {len(results)} documents for query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            return []
    
    def retrieve_with_scores(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        try:
            if not self.initialized:
                logger.error("Retriever not initialized")
                return []
            
            # Get documents with scores
            docs_with_scores = self.embeddings.similarity_search_with_score(query, k=k)
            
            # Format results
            results = []
            for doc, score in docs_with_scores:
                results.append({
                    "content": doc.page_content,
                    "source": doc.metadata.get("source", "Unknown"),
                    "document_type": doc.metadata.get("document_type", "Unknown"),
                    "similarity_score": float(score)
                })
            
            logger.info(f"Retrieved {len(results)} documents with scores for query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Error retrieving documents with scores: {e}")
            return []
    
    def add_document(self, file_path: str) -> bool:
        try:
            # Process the new document
            if self.document_processor.process_document(file_path):
                # Get the new document chunks
                new_documents = self.document_processor.get_processed_documents()
                
                # Add to vector store
                if self.embeddings.add_documents(new_documents):
                    # Update retriever
                    self.retriever = self.embeddings.get_retriever({"k": 5})
                    logger.info(f"Added document {file_path} to retriever")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error adding document to retriever: {e}")
            return False
    
    def search_by_category(self, query: str, category: str = None) -> List[Dict[str, Any]]:
        try:
            # Modify query based on category
            if category:
                enhanced_query = f"{category} {query}"
            else:
                enhanced_query = query
            
            return self.retrieve_documents(enhanced_query)
            
        except Exception as e:
            logger.error(f"Error searching by category: {e}")
            return []
