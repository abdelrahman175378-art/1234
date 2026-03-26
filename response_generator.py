
import json
import random
import re

class ResponseGenerator:
    def __init__(self, responses_path):
        with open(responses_path, 'r', encoding='utf-8') as f:
            self.responses = json.load(f)

    def is_arabic(self, text):
        # Detect Arabic characters range
        return bool(re.search(r'[\u0600-\u06FF]', text))

    def get_response(self, intent, text):
        lang = 'ar' if self.is_arabic(text) else 'en'
        options = self.responses.get(intent, self.responses['fallback']).get(lang)
        return random.choice(options)
