import logging
from typing import Dict, List, Any

from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate

from retriever import HealthcareRetriever

logger = logging.getLogger(__name__)

class HealthcareQAChain:
    def __init__(self, model_name: str = "gpt-4.1-nano"):
        self.llm = ChatOpenAI(model_name=model_name, temperature=0.1)
        self.retriever_instance = HealthcareRetriever()
        
        # Define prompts for different modes
        self.standard_prompt = PromptTemplate(
            template="""You are a healthcare terminology and processes expert. 
            Use the following context to answer the question accurately and clearly.
            
            Context: {context}
            
            Question: {question}
            
            Provide a comprehensive answer that:
            1. Directly answers the question
            2. Includes relevant details and context
            3. Mentions the source of information when available
            4. Uses clear, professional language
            
            Answer:""",
            input_variables=["context", "question"]
        )
        
        self.simple_prompt = PromptTemplate(
            template="""You are explaining healthcare terms to someone new to healthcare. 
            Use the following context to provide a simple, easy-to-understand explanation.
            
            Context: {context}
            
            Question: {question}
            
            Provide a simple explanation that:
            1. Uses everyday language
            2. Avoids complex jargon
            3. Includes practical examples
            4. Is easy for beginners to understand
            
            Answer:""",
            input_variables=["context", "question"]
        )
        
        self.technical_prompt = PromptTemplate(
            template="""You are providing detailed technical information to healthcare professionals.
            Use the following context to give a comprehensive, technical explanation.
            
            Context: {context}
            
            Question: {question}
            
            Provide a detailed technical answer that:
            1. Includes all relevant technical details
            2. Uses proper healthcare terminology
            3. Covers regulatory and compliance aspects
            4. Provides complete professional-level information
            
            Answer:""",
            input_variables=["context", "question"]
        )
        
        self.glossary_prompt = PromptTemplate(
            template="""Provide a concise definition for the healthcare term or concept.
            
            Context: {context}
            
            Term: {question}
            
            Provide a brief definition that:
            1. Gives a clear, concise definition
            2. Includes the acronym expansion if applicable
            3. Mentions key usage or application
            4. Keeps it under 3 sentences
            
            Definition:""",
            input_variables=["context", "question"]
        )
    
    def get_answer(self, question: str) -> Dict[str, Any]:
        try:
            # Check if retriever is initialized
            if not self.retriever_instance.initialized or self.retriever_instance.retriever is None:
                # Try to reinitialize the retriever
                logger.warning("Retriever not initialized, attempting to reinitialize...")
                if not self.retriever_instance.initialize_sync():
                    # Fallback mode - basic healthcare info without vector search
                    return self._get_fallback_answer(question)
            
            # Double-check retriever is available
            if self.retriever_instance.retriever is None:
                return {
                    "answer": "I'm sorry, the document retrieval system is not available. Please check the system configuration.",
                    "sources": []
                }
            
            # Create RetrievalQA chain
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.retriever_instance.retriever,
                chain_type_kwargs={"prompt": self.standard_prompt},
                return_source_documents=True
            )
            
            # Get answer
            result = qa_chain.invoke({"query": question})
            
            # Extract sources
            sources = []
            for doc in result.get("source_documents", []):
                source = doc.metadata.get("source", "Unknown")
                if source not in sources:
                    sources.append(source)
            
            return {
                "answer": result["result"],
                "sources": sources
            }
            
        except Exception as e:
            logger.error(f"Error getting answer: {e}")
            return {
                "answer": "I'm sorry, I encountered an error while processing your question.",
                "sources": []
            }
    
    def get_simple_answer(self, question: str) -> Dict[str, Any]:
        try:
            # Check if retriever is initialized
            if not self.retriever_instance.initialized or self.retriever_instance.retriever is None:
                if not self.retriever_instance.initialize_sync():
                    return {
                        "answer": "I'm sorry, the system is still initializing. Please check your environment variables and try again.",
                        "sources": []
                    }
            
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.retriever_instance.retriever,
                chain_type_kwargs={"prompt": self.simple_prompt},
                return_source_documents=True
            )
            
            result = qa_chain.invoke({"query": question})
            
            sources = []
            for doc in result.get("source_documents", []):
                source = doc.metadata.get("source", "Unknown")
                if source not in sources:
                    sources.append(source)
            
            return {
                "answer": result["result"],
                "sources": sources
            }
            
        except Exception as e:
            logger.error(f"Error getting simple answer: {e}")
            return {
                "answer": "I'm sorry, I encountered an error while processing your question.",
                "sources": []
            }
    
    def get_technical_answer(self, question: str) -> Dict[str, Any]:
        try:
            # Check if retriever is initialized
            if not self.retriever_instance.initialized or self.retriever_instance.retriever is None:
                if not self.retriever_instance.initialize_sync():
                    return {
                        "answer": "I'm sorry, the system is still initializing. Please check your environment variables and try again.",
                        "sources": []
                    }
            
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.retriever_instance.retriever,
                chain_type_kwargs={"prompt": self.technical_prompt},
                return_source_documents=True
            )
            
            result = qa_chain.invoke({"query": question})
            
            sources = []
            for doc in result.get("source_documents", []):
                source = doc.metadata.get("source", "Unknown")
                if source not in sources:
                    sources.append(source)
            
            return {
                "answer": result["result"],
                "sources": sources
            }
            
        except Exception as e:
            logger.error(f"Error getting technical answer: {e}")
            return {
                "answer": "I'm sorry, I encountered an error while processing your question.",
                "sources": []
            }
    
    def get_definition(self, term: str) -> Dict[str, Any]:
        try:
            # Check if retriever is initialized
            if not self.retriever_instance.initialized or self.retriever_instance.retriever is None:
                if not self.retriever_instance.initialize_sync():
                    return {
                        "answer": "I'm sorry, the system is still initializing. Please check your environment variables and try again.",
                        "sources": []
                    }
            
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.retriever_instance.retriever,
                chain_type_kwargs={"prompt": self.glossary_prompt},
                return_source_documents=True
            )
            
            result = qa_chain.invoke({"query": term})
            
            sources = []
            for doc in result.get("source_documents", []):
                source = doc.metadata.get("source", "Unknown")
                if source not in sources:
                    sources.append(source)
            
            return {
                "answer": result["result"],
                "sources": sources
            }
            
        except Exception as e:
            logger.error(f"Error getting definition: {e}")
            return {
                "answer": "I'm sorry, I encountered an error while processing your request.",
                "sources": []
            }
    
    def compare_terms(self, term1: str, term2: str) -> Dict[str, Any]:
        try:
            # Create a comparison prompt that only uses context and query
            comparison_prompt = PromptTemplate(
                template="""Compare and contrast the following two healthcare terms or concepts.
                Use the provided context to give accurate information.
                
                Context: {context}
                
                Question: {question}
                
                Provide a comparison that:
                1. Defines both terms clearly
                2. Highlights key similarities
                3. Explains important differences
                4. Provides practical examples of when each is used
                
                Comparison:""",
                input_variables=["context", "question"]
            )
            
            # Check if retriever is initialized
            if not self.retriever_instance.initialized or self.retriever_instance.retriever is None:
                if not self.retriever_instance.initialize_sync():
                    return {
                        "comparison": "I'm sorry, the system is still initializing. Please check your environment variables and try again.",
                        "sources": []
                    }
            
            # Create a combined query for retrieval
            query = f"Compare {term1} vs {term2} - differences similarities healthcare"
            
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.retriever_instance.retriever,
                chain_type_kwargs={"prompt": comparison_prompt},
                return_source_documents=True
            )
            
            result = qa_chain.invoke({"query": query})
            
            sources = []
            for doc in result.get("source_documents", []):
                source = doc.metadata.get("source", "Unknown")
                if source not in sources:
                    sources.append(source)
            
            return {
                "comparison": result["result"],
                "sources": sources
            }
            
        except Exception as e:
            logger.error(f"Error comparing terms: {e}")
            return {
                "comparison": "I'm sorry, I encountered an error while comparing these terms.",
                "sources": []
            }
    
    def _get_fallback_answer(self, question: str) -> Dict[str, Any]:
        basic_healthcare_info = {
            "hcpcs": "HCPCS (Healthcare Common Procedure Coding System) is a standardized coding system for medical procedures and supplies.",
            "cpt": "CPT (Current Procedural Terminology) codes describe medical, surgical, and diagnostic services.",
            "icd": "ICD-10 is a medical classification system for coding diagnoses and symptoms.",
            "dme": "DME (Durable Medical Equipment) refers to reusable medical equipment like wheelchairs and oxygen equipment.",
            "edi": "EDI (Electronic Data Interchange) is the electronic exchange of healthcare business information.",
            "hipaa": "HIPAA provides data privacy and security provisions for medical information.",
            "cms": "CMS (Centers for Medicare & Medicaid Services) administers Medicare and Medicaid programs.",
        }
        
        question_lower = question.lower()
        for term, definition in basic_healthcare_info.items():
            if term in question_lower:
                return {
                    "answer": f"{definition}\n\nNote: System is initializing. For more detailed information, please check your environment setup and try again.",
                    "sources": ["Basic Healthcare Glossary"]
                }
        
        return {
            "answer": "I'm sorry, the system is still initializing. Please check your environment variables (OPENAI_API_KEY) and try again. For immediate help with basic terms like HCPCS, CPT, ICD-10, DME, EDI, HIPAA, or CMS, please ask specifically about those terms.",
            "sources": []
        }
