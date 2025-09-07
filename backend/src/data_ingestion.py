import os
from typing import List, Dict
from pathlib import Path
import logging

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self, data_dir: str = "../data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # Text splitter for chunking documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        
        self.processed_documents = []
    
    def load_pdf(self, file_path: str) -> List[Document]:
        try:
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            logger.info(f"Loaded PDF: {file_path} with {len(documents)} pages")
            return documents
        except Exception as e:
            logger.error(f"Error loading PDF {file_path}: {e}")
            return []
    
    def load_text(self, file_path: str) -> List[Document]:
        try:
            loader = TextLoader(file_path)
            documents = loader.load()
            logger.info(f"Loaded text file: {file_path}")
            return documents
        except Exception as e:
            logger.error(f"Error loading text file {file_path}: {e}")
            return []
    
    def process_document(self, file_path: str) -> bool:
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                logger.error(f"File not found: {file_path}")
                return False
            
            # Load document based on file type
            if file_path.suffix.lower() == '.pdf':
                documents = self.load_pdf(str(file_path))
            elif file_path.suffix.lower() in ['.txt', '.md']:
                documents = self.load_text(str(file_path))
            else:
                logger.error(f"Unsupported file type: {file_path.suffix}")
                return False
            
            if not documents:
                return False
            
            # Add metadata
            for doc in documents:
                doc.metadata.update({
                    'source': str(file_path),
                    'document_type': 'healthcare',
                    'processed': True
                })
            
            # Split documents into chunks
            chunks = self.text_splitter.split_documents(documents)
            
            # Store processed chunks
            self.processed_documents.extend(chunks)
            
            logger.info(f"Successfully processed {file_path}: {len(chunks)} chunks created")
            return True
            
        except Exception as e:
            logger.error(f"Error processing document {file_path}: {e}")
            return False
    
    def process_directory(self, directory_path: str = None) -> int:
        if directory_path is None:
            directory_path = self.data_dir
        
        directory_path = Path(directory_path)
        processed_count = 0
        
        for file_path in directory_path.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in ['.pdf', '.txt', '.md']:
                if self.process_document(str(file_path)):
                    processed_count += 1
        
        logger.info(f"Processed {processed_count} documents from {directory_path}")
        return processed_count
    
    def get_processed_documents(self) -> List[Document]:
        return self.processed_documents
    
    def list_documents(self) -> List[Dict]:
        documents_info = []
        seen_sources = set()
        
        for doc in self.processed_documents:
            source = doc.metadata.get('source', 'Unknown')
            if source not in seen_sources:
                seen_sources.add(source)
                documents_info.append({
                    'source': source,
                    'document_type': doc.metadata.get('document_type', 'Unknown'),
                    'chunks': sum(1 for d in self.processed_documents if d.metadata.get('source') == source)
                })
        
        return documents_info
    
    async def initialize_sample_data(self):
        # Create sample healthcare glossary
        sample_glossary = """
        Healthcare Terms Glossary
        
        HCPCS (Healthcare Common Procedure Coding System):
        A standardized coding system used to describe specific items and services provided in the delivery of health care. HCPCS has two levels:
        - Level I: CPT codes (Current Procedural Terminology)
        - Level II: Codes for products, supplies, and services not included in CPT
        
        CPT (Current Procedural Terminology):
        A medical code set maintained by the American Medical Association (AMA) that is used to describe medical, surgical, and diagnostic services and procedures.
        
        ICD-10 (International Classification of Diseases, 10th Revision):
        A medical classification system used for coding diagnoses, symptoms, and procedures in hospital and clinical settings.
        
        DME (Durable Medical Equipment):
        Reusable medical equipment like wheelchairs, hospital beds, oxygen equipment, and mobility aids that can withstand repeated use.
        
        EDI (Electronic Data Interchange):
        The electronic exchange of business information using a standardized format. In healthcare, common EDI transactions include:
        - 837: Healthcare claim submission
        - 835: Electronic remittance advice
        - 270/271: Eligibility inquiry and response
        
        HIPAA (Health Insurance Portability and Accountability Act):
        Federal legislation that provides data privacy and security provisions for safeguarding medical information.
        
        CMS (Centers for Medicare & Medicaid Services):
        A federal agency that administers Medicare, Medicaid, and other healthcare programs.
        
        Prior Authorization:
        A requirement by health insurance plans that certain medications, procedures, or equipment be approved before coverage.
        
        Copay:
        A fixed amount a patient pays for a covered healthcare service, usually at the time of service.
        
        Deductible:
        The amount a patient must pay for healthcare services before insurance begins to pay.
        
        Claim Processing Workflow:
        1. Healthcare service provided to patient
        2. Provider submits claim (EDI 837) to payer
        3. Payer reviews claim for accuracy and coverage
        4. Payer processes payment or denial
        5. Provider receives payment and explanation (EDI 835)
        6. Patient receives explanation of benefits (EOB)
        """
        
        # Save sample data
        sample_file = self.data_dir / "healthcare_glossary.txt"
        with open(sample_file, "w", encoding="utf-8") as f:
            f.write(sample_glossary)
        
        # Process the sample data
        self.process_document(str(sample_file))
        
        logger.info("Sample healthcare data initialized")
        return True
    
    def initialize_sample_data_sync(self):
        # Create sample healthcare glossary
        sample_glossary = """
        Healthcare Terms Glossary
        
        HCPCS (Healthcare Common Procedure Coding System):
        A standardized coding system used to describe specific items and services provided in the delivery of health care. HCPCS has two levels:
        - Level I: CPT codes (Current Procedural Terminology)
        - Level II: Codes for products, supplies, and services not included in CPT
        
        CPT (Current Procedural Terminology):
        A medical code set maintained by the American Medical Association (AMA) that is used to describe medical, surgical, and diagnostic services and procedures.
        
        ICD-10 (International Classification of Diseases, 10th Revision):
        A medical classification system used for coding diagnoses, symptoms, and procedures in hospital and clinical settings.
        
        DME (Durable Medical Equipment):
        Reusable medical equipment like wheelchairs, hospital beds, oxygen equipment, and mobility aids that can withstand repeated use.
        
        EDI (Electronic Data Interchange):
        The electronic exchange of business information using a standardized format. In healthcare, common EDI transactions include:
        - 837: Healthcare claim submission
        - 835: Electronic remittance advice
        - 270/271: Eligibility inquiry and response
        
        HIPAA (Health Insurance Portability and Accountability Act):
        Federal legislation that provides data privacy and security provisions for safeguarding medical information.
        
        CMS (Centers for Medicare & Medicaid Services):
        A federal agency that administers Medicare, Medicaid, and other healthcare programs.
        
        Prior Authorization:
        A requirement by health insurance plans that certain medications, procedures, or equipment be approved before coverage.
        
        Copay:
        A fixed amount a patient pays for a covered healthcare service, usually at the time of service.
        
        Deductible:
        The amount a patient must pay for healthcare services before insurance begins to pay.
        
        Claim Processing Workflow:
        1. Healthcare service provided to patient
        2. Provider submits claim (EDI 837) to payer
        3. Payer reviews claim for accuracy and coverage
        4. Payer processes payment or denial
        5. Provider receives payment and explanation (EDI 835)
        6. Patient receives explanation of benefits (EOB)
        """
        
        # Save sample data
        sample_file = self.data_dir / "healthcare_glossary.txt"
        with open(sample_file, "w", encoding="utf-8") as f:
            f.write(sample_glossary)
        
        # Process the sample data
        self.process_document(str(sample_file))
        
        logger.info("Sample healthcare data initialized (sync)")
        return True
