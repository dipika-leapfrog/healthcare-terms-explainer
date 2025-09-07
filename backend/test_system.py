#!/usr/bin/env python3
"""
Quick test script to verify the healthcare system works
"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def test_basic_functionality():
    """Test basic system functionality"""
    try:
        from chains import HealthcareQAChain
        
        print("🔧 Initializing Healthcare QA Chain...")
        qa_chain = HealthcareQAChain()
        
        print("🧪 Testing basic question...")
        result = qa_chain.get_definition("HCPCS")
        
        print(f"✅ Answer: {result['answer']}")
        print(f"📚 Sources: {result['sources']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔍 Troubleshooting:")
        print("1. Check if OPENAI_API_KEY is set in .env file")
        print("2. Install dependencies: pip install -r requirements.txt")
        print("3. Check if ChromaDB is installed: pip install chromadb")
        return False

if __name__ == "__main__":
    print("🏥 Healthcare Explainer System Test")
    print("=" * 40)
    
    # Check environment
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  Warning: OPENAI_API_KEY not found in environment")
        print("Please set it in backend/.env file")
    
    success = test_basic_functionality()
    
    if success:
        print("\n🎉 System is working!")
    else:
        print("\n❌ System needs configuration")
    
    print("\n📖 Next steps:")
    print("- Run: python src/main.py")
    print("- Visit: http://localhost:8000")
