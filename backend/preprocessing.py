from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

class ResumePreprocessor:
    def _init_(self):
        self.vectorizer = TfidfVectorizer(max_features=50, lowercase=True)
    
    def clean_text(self, text):
        return text.lower().strip()
    
    def fit(self, resumes):
        cleaned = [self.clean_text(r) for r in resumes]
        self.vectorizer.fit(cleaned)
    
    def transform(self, resumes):
        cleaned = [self.clean_text(r) for r in resumes]
        return self.vectorizer.transform(cleaned).toarray()
    
    def load_from_file(self, filepath):
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()