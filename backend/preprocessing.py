from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

class ResumePreprocessor:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=50, lowercase=True)
        self.fitted = False
    
    def clean_text(self, text):
        """Remove extra whitespace and convert to lowercase"""
        return text.lower().strip()
    
    def fit(self, resumes):
        """Fit vectorizer on resumes"""
        cleaned = [self.clean_text(r) for r in resumes]
        self.vectorizer.fit(cleaned)
        self.fitted = True
    
    def transform(self, resumes):
        """Convert resumes to TF-IDF vectors"""
        cleaned = [self.clean_text(r) for r in resumes]
        return self.vectorizer.transform(cleaned).toarray()
    
    def fit_transform(self, resumes):
        """Fit and transform in one step"""
        self.fit(resumes)
        return self.transform(resumes)
    
    def load_from_file(self, filepath):
        """Load resume from text file"""
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except:
            return ""

if __name__ == "__main__":
    print("✓ preprocessing.py loaded")