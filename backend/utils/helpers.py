import re
import fitz  # PyMuPDF
from fastapi import HTTPException

# Enhanced PDF text extraction
def extract_text_from_pdf(file_content):
    try:
        with fitz.open(stream=file_content, filetype="pdf") as pdf:
            text_parts = []
            for page_num, page in enumerate(pdf):
                if page_num >= 3:  # Limit to first 3 pages
                    break
                page_text = page.get_text("text")
                if page_text.strip():
                    text_parts.append(page_text)
            
            full_text = "\n".join(text_parts)
            # Clean up the text
            full_text = re.sub(r'\n+', '\n', full_text)
            full_text = re.sub(r'\s+', ' ', full_text)
            
            return full_text[:4000]  # Increased limit for better analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

def clean_gemini_response(text):
    """Clean and format Gemini API response"""
    # Remove markdown formatting
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    
    # Clean up extra whitespace
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()
