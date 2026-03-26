
from flask import Blueprint, request, jsonify, session
from app.nlp.intent_classifier import IntentClassifier
from app.nlp.response_generator import ResponseGenerator
from utils.logger import setup_logger

chat_bp = Blueprint('chat', __name__)
logger = setup_logger()

# Initialize NLP Components
classifier = IntentClassifier('config/intents.json')
generator = ResponseGenerator('config/responses.json')

HUMAN_FALLBACK_THRESHOLD = 2
WHATSAPP_LINK = "https://wa.me/97470342042"

@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_text = data.get('message', '').strip()
    
    if not user_text:
        return jsonify({"reply": "..."})

    # Intent Detection
    intent = classifier.predict(user_text)
    
    # Human Counter Logic
    if intent == 'human':
        session['human_count'] = session.get('human_count', 0) + 1
    else:
        # Reset if they ask something else? Optional. 
        pass

    # Check for forced WhatsApp fallback
    if session.get('human_count', 0) >= HUMAN_FALLBACK_THRESHOLD:
        is_ar = generator.is_arabic(user_text)
        reply = "تقدر تتواصل مباشرة مع خدمة العملاء على واتساب:\n" + WHATSAPP_LINK if is_ar else "You can contact customer service directly on WhatsApp:\n" + WHATSAPP_LINK
        return jsonify({"reply": reply, "forced_human": True})

    # Generate Response
    reply = generator.get_response(intent, user_text)
    
    logger.info(f"User: {user_text} | Intent: {intent} | Reply: {reply}")
    
    return jsonify({
        "reply": reply,
        "intent": intent,
        "lang": "ar" if generator.is_arabic(user_text) else "en"
    })
