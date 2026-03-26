
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

class IntentClassifier:
    def __init__(self, intents_path):
        with open(intents_path, 'r', encoding='utf-8') as f:
            self.intents_data = json.load(f)
        
        self.model = self._train_model()

    def _train_model(self):
        X = []
        y = []
        for intent, patterns in self.intents_data.items():
            for pattern in patterns:
                X.append(pattern.lower())
                y.append(intent)
        
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
            ('clf', MultinomialNB(alpha=0.1))
        ])
        
        pipeline.fit(X, y)
        return pipeline

    def predict(self, text):
        text = text.lower()
        # Basic confidence check
        probs = self.model.predict_proba([text])[0]
        max_prob = np.max(probs)
        
        if max_prob < 0.25:
            return "fallback"
            
        return self.model.predict([text])[0]
