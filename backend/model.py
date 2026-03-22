from sklearn.linear_model import LogisticRegression
import numpy as np

class ResumeClassifier:
    def __init__(self):
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        self.fitted = False
    
    def train(self, X, y):
        """Train the model"""
        self.model.fit(X, y)
        self.fitted = True
    
    def predict(self, X):
        """Predict labels (0 or 1)"""
        if not self.fitted:
            return np.zeros(len(X))
        return self.model.predict(X)
    
    def predict_proba(self, X):
        """Get probability scores (0-1)"""
        if not self.fitted:
            return np.ones(len(X)) * 0.5
        return self.model.predict_proba(X)[:, 1]
    
    def accuracy(self, X, y):
        """Calculate accuracy score"""
        if not self.fitted:
            return 0.5
        return self.model.score(X, y)
    
    def get_weights(self):
        """Extract model weights for sharing"""
        if not self.fitted:
            return {'coef': [0] * 50, 'intercept': 0.0}
        return {
            'coef': self.model.coef_[0].tolist(),
            'intercept': float(self.model.intercept_[0])
        }
    
    def set_weights(self, weights_dict):
        """Set model weights from aggregated data"""
        try:
            self.model.coef_ = np.array([weights_dict['coef']])
            self.model.intercept_ = np.array([weights_dict['intercept']])
            self.fitted = True
        except:
            pass

if __name__ == "__main__":
    print("✓ model.py loaded")