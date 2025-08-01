# Flask CORS Configuration for 3D API Server
# Add this to your Flask app

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS to allow requests from Vite dev server
CORS(app, 
     origins=['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
     supports_credentials=False,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Accept', 'Authorization'])

# Your existing route
@app.route('/api/aps/v2/upload-step', methods=['POST', 'OPTIONS'])
def upload_step():
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return '', 200
    
    # Your existing logic here
    data = request.get_json()
    file_url = data.get('file_url')
    scopes = data.get('scopes', [])
    
    # Your existing processing logic...
    
    return jsonify({
        "success": True,
        "urn": "urn:adsk.objects:os.object:your-bucket:your-file.ipt"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True) 