
from flask import Flask, render_template
from app.routes.chat import chat_bp
import os

app = Flask(__name__, 
            template_folder='../templates', 
            static_folder='../static')

app.secret_key = os.urandom(24) # For session encryption

# Register Blueprints
app.register_blueprint(chat_bp)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
