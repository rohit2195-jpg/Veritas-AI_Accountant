from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import pandas as pd

from category import batch_categorize
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from sqlalchemy.dialects.postgresql import JSON




load_dotenv()


app = Flask(__name__)
CORS(app, support_credentials=True)


DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT")


app.config['SQLALCHEMY_DATABASE_URI'] = (
    f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
)
db = SQLAlchemy(app)

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = set(['csv'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

class Preferences(db.Model):
    userid = db.Column(db.Integer, primary_key=True)
    categories = db.Column(JSON)

class Transaction(db.Model):

    id = db.Column(db.Integer, primary_key=True, autoincrement=True) 
    userid = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(10), nullable=False)
    category = db.Column(db.String(100), nullable=False)



@app.route('/uploadcsv', methods=['POST'])
def hello():
    engine = db.engine

    if 'filename' not in request.files:
        return jsonify({'error': 'No file found'}), 400
    file = request.files['filename']
    categories = request.form['categories']
    print(file)
    if file.filename == '':
        return jsonify({'error': 'No file found'}), 400

    print("Current working directory:", os.getcwd())

    filename = secure_filename(file.filename)
    file_path = os.path.join(".", "uploads", filename)
    file.save(file_path)

    try:
        standard_columns = ['date', 'description', 'amount', 'balance']
        print("here")

        df = pd.read_csv(file_path)
        print(df.head())
        print(categories)
        userid = 11

        standardized_df = df
        #standardized_df = batch_standardize(df)
        print("After cleaning")
        print(standardized_df.head())
        sameCategories = True
        # check is it the same categoires form the dataset
        standardized_df["userid"] = userid
        print(standardized_df.head())
        db.create_all()


        pref = db.session.get(Preferences, userid)
        if not pref:
            pref = Preferences(userid=userid, categories=categories)
            db.session.add(pref)
            db.session.commit()

        #same categories - easy
        if categories == pref.categories:
            standardized_df = batch_categorize(standardized_df, categories)
            print("After categorization")
            print(standardized_df.head())

            standardized_df.to_sql('Transaction', con=engine, if_exists='append', index=False)
            #upload it to exisiting dataset
        else:
            print("not same categories")
            pref.categories = categories
            db.session.commit()


            transaction_data = Transaction.query.filter_by(userid=userid).all()
            transaction_data = pd.DataFrame([{
                "userid": t.userid,
                "date": t.date,
                "description": t.description,
                "amount": t.amount,
                "type": t.type,
                "category": t.category
            } for t in transaction_data])
            transaction_data = batch_categorize(transaction_data, categories)
            for i, t in enumerate(transaction_data):
                t.category = transaction_data.iloc[i]["category"]
            db.session.commit()


            standardized_df = batch_categorize(standardized_df, categories)
            print(standardized_df.head())

            standardized_df.to_sql('Transaction', con=engine, if_exists='append', index=False)


        pref = db.session.get(Preferences, userid)
        print(pref.categories)

        standardized_df.to_csv("temp.csv", index=False)
    except Exception as e:
        print("Error reading file")
        print(f"Error reading or processing file: {e}")

    finally:
        print("done")
        '''
        if os.path.exists(file_path):
            os.remove(file_path)
        '''
        return jsonify({'filename': filename}), 200



if __name__ == '__main__':
    app.run(debug=True)

