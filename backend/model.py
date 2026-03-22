from sklearn.linear_model import LogisticRegression
import numpy as np

class ResumeClassifier:
    def __init__(self):
        self.model = LogisticRegression(max_iter=1000, random_state=42)
    
    def train(self, X, y):
        self.model.fit(X, y)
    
    def predict(self, X):
        return self.model.predict(X)
    
    def predict_proba(self, X):
        return self.model.predict_proba(X)[:, 1]
    
    def accuracy(self, X, y):
        return self.model.score(X, y)
    
    def get_weights(self):
        return {
            'coef': self.model.coef_[0].tolist(),
            'intercept': float(self.model.intercept_[0])
        }
    
    def set_weights(self, weights_dict):
        self.model.coef_ = np.array([weights_dict['coef']])
        self.model.intercept_ = np.array([weights_dict['intercept']])