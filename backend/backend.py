from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import pandas as pd
from rapidfuzz import process, fuzz

app = Flask(__name__)
CORS(app, support_credentials=True)

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = set(['csv'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app, support_credentials=True)

@app.route('/uploadcsv', methods=['POST'])
def hello():
    if 'filename' not in request.files:
        return jsonify({'error': 'No file found'}), 400
    file = request.files['filename']
    print(file)
    if file.filename == '':
        return jsonify({'error': 'No file found'}), 400

    print("Current working directory:", os.getcwd())

    filename = secure_filename(file.filename)
    file_path = os.path.join(".", "uploads", filename)
    file.save(file_path)

    try:
        standard_columns = ['date', 'description', 'amount', 'balance']

        df = pd.read_csv(file_path)
        print(df.head())
    except:
        print("Error reading file")

    finally:
        print("done")
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'filename': filename}), 200



if __name__ == '__main__':
    app.run(debug=True)

