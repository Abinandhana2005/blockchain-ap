from model import ResumeClassifier
from preprocessing import ResumePreprocessor
import numpy as np
import hashlib
import json

class SwarmNode:
    def __init__(self, node_id, resumes, labels):
        self.node_id = node_id
        self.resumes = resumes
        self.labels = np.array(labels)
        self.model = ResumeClassifier()
        self.preprocessor = ResumePreprocessor()
        self.weights_history = []
        self.accuracy_history = []
    
    def preprocess(self):
        """Prepare data using TF-IDF"""
        if len(self.resumes) == 0:
            return np.array([]).reshape(0, 50), self.labels
        
        self.preprocessor.fit(self.resumes)
        X = self.preprocessor.transform(self.resumes)
        return X, self.labels
    
    def train_local(self):
        """Train model locally"""
        X, y = self.preprocess()
        
        if len(X) == 0:
            return {'coef': [0] * 50, 'intercept': 0.0}, 0.5
        
        self.model.train(X, y)
        accuracy = self.model.accuracy(X, y)
        weights = self.model.get_weights()
        
        self.weights_history.append(weights)
        self.accuracy_history.append(accuracy)
        
        return weights, accuracy
    
    def get_weights_hash(self, weights):
        """Create SHA256 hash of weights"""
        w_str = json.dumps(weights, sort_keys=True)
        return hashlib.sha256(w_str.encode()).hexdigest()
    
    def update_weights(self, weights):
        """Update model with new weights"""
        if weights:
            self.model.set_weights(weights)
    
    def get_latest_weights(self):
        """Get most recent weights"""
        return self.weights_history[-1] if self.weights_history else None
    
    def get_accuracy(self):
        """Get most recent accuracy"""
        return self.accuracy_history[-1] if self.accuracy_history else 0.0

if __name__ == "__main__":
    print("✓ node.py loaded")