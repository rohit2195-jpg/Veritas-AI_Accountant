import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import pandas as pd
from sqlalchemy.orm import Session
import requests
from category import batch_categorize, batch_categorize2
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from sqlalchemy.dialects.postgresql import JSON
import calendar
from chatbot import ask_chatbot




load_dotenv()
userid = 11
userid_key = userid

app = Flask(__name__)
CORS(app, support_credentials=True)


DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT")

colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"]


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
    __tablename__ = 'transaction'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True) 
    userid = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(10), nullable=False)
    category = db.Column(db.String(100), nullable=False)

@app.route('/load_categories', methods=['POST'])
def load_categories():
    print("here")
    engine = db.engine
    print(engine.url)

    try:
        pref = db.session.get(Preferences, userid_key)
        print(pref)
    except Exception as e:
        return "no data", 400
    print(pref.categories)
    return pref.categories

@app.route('/uploadcsv', methods=['POST'])
def upload_csv():
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

            standardized_df.to_sql('transaction', con=engine, if_exists='append', index=False)
            #upload it to exisiting dataset
        else:
            print("not same categories")
            pref.categories = categories
            db.session.commit()


            transaction = Transaction.query.filter_by(userid=userid).all()
            transaction_data = pd.DataFrame([{
                "userid": t.userid,
                "date": t.date,
                "description": t.description,
                "amount": t.amount,
                "type": t.type,
                "category": t.category,
                "id": t.id,
            } for t in transaction])
            print(transaction_data.head())
            transaction_data = batch_categorize2(transaction_data, categories)
            for t in transaction:
                new_category = transaction_data.loc[transaction_data["id"] == t.id, "category"].values[0]
                t.category = new_category
            db.session.commit()


            standardized_df = batch_categorize(standardized_df, categories)
            print(standardized_df.head())

            standardized_df.to_sql('transaction', con=engine, if_exists='append', index=False)


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

@app.route('/view_transactions', methods=['POST'])
def hello():
    print("here")
    engine = db.engine
    print(engine.url)
    session = Session(engine)

    try:
        results = session.query(Transaction).filter_by(userid=userid_key).all()
        print(results)
    except Exception as e:
        return "no data", 400
    print(results)
    data = [r.__dict__ for r in results]
    for row in data:
        row.pop('_sa_instance_state', None)
    df = pd.DataFrame(data)
    df.drop("userid", axis=1, inplace=True)
    print(df)

    return jsonify(df.to_dict(orient='records'))


#Dashboard charts
@app.route('/api/expensesby-category', methods=['POST'])
def expenses_by_category():
    print("here")
    engine = db.engine
    print(engine.url)
    session = Session(engine)

    try:
        results = session.query(Transaction).filter_by(userid=userid_key).all()
        print(results)
    except Exception as e:
        return "no data", 400
    print(results)
    data = [r.__dict__ for r in results]
    for row in data:
        row.pop('_sa_instance_state', None)
    data = pd.DataFrame(data)
    current_date = datetime.datetime.now()
    one_year_ago = current_date - datetime.timedelta(days=31)
    df_last_year = data[data['date'] >= one_year_ago]
    spending = df_last_year[data["type"] == "debit"]
    spending["amount"] = spending["amount"].abs()
    res = spending.groupby("category")['amount'].sum()

    return jsonify({
        "labels": res.index.tolist(),
        "datasets": [
            {
                "data": res.values.tolist(),
                "backgroundColor": colors[:len(res)]
            }
        ]
    })

@app.route('/api/timegraphs', methods=['POST'])
def time_graphs():
    print("here")
    engine = db.engine
    session = Session(engine)

    try:
        results = session.query(Transaction).filter_by(userid=userid_key).all()

    except Exception as e:
        return "no data", 400
    print(results)
    data = [r.__dict__ for r in results]
    for row in data:
        row.pop('_sa_instance_state', None)
    data = pd.DataFrame(data)
    data["date"] = pd.to_datetime(data["date"])
    current_date = datetime.datetime.now()
    one_year_ago = current_date - datetime.timedelta(days=365)
    df_last_year = data[data['date'] >= one_year_ago]
    df_last_year["month"] = pd.to_datetime(df_last_year["date"]).dt.month
    credit = df_last_year[df_last_year["type"] == "credit"]
    debit = df_last_year[df_last_year["type"] == "debit"]
    debit["amount"] = debit["amount"].abs()
    res1 = credit.groupby("month")["amount"].sum()

    res2 = debit.groupby("month")["amount"].sum()
    months = sorted(set(res1.index).union(res2.index))

    res1 = res1.reindex(months, fill_value=0)
    res2 = res2.reindex(months, fill_value=0)

    return jsonify({
        "labels": [calendar.month_name[m] for m in months],
        "datasets": [
            {
                "label": "Inflow",
                "data": res1.values.tolist(),
                "backgroundColor": colors[0]
            },
            {
                "label": "Outflow",
                "data": res2.values.tolist(),
                "backgroundColor": colors[1]
            }
        ]
    })


@app.route('/api/inoutgraph', methods=['POST'])
def in_out_graphs():
    print("here")
    engine = db.engine
    session = Session(engine)

    try:
        results = session.query(Transaction).filter_by(userid=userid_key).all()

    except Exception as e:
        return "no data", 400
    print(results)
    data = [r.__dict__ for r in results]
    for row in data:
        row.pop('_sa_instance_state', None)
    data = pd.DataFrame(data)
    data["date"] = pd.to_datetime(data["date"])
    data["amount"] = data["amount"].abs()
    data["year"] = pd.to_datetime(data["date"]).dt.year
    credit = data[data["type"] == "credit"]
    debit = data[data["type"] == "debit"]
    res1 = credit.groupby("year")["amount"].sum()

    res2 = debit.groupby("year")["amount"].sum()
    years = sorted(set(res1.index).union(res2.index))

    res1 = res1.reindex(years, fill_value=0)
    res2 = res2.reindex(years, fill_value=0)

    return jsonify({
        "labels": years,
        "datasets": [
            {
                "label": "Inflow",
                "data": res1.values.tolist(),
                "backgroundColor": colors[0]
            },
            {
                "label": "Outflow",
                "data": res2.values.tolist(),
                "backgroundColor": colors[1]
            }
        ]
    })

@app.route('/ask_question', methods=['POST'])
def chatbot():
    user_query = request.form['message']
    with app.app_context():
        engine = db.engine
        session = Session(engine)

        try:
            results = session.query(Transaction).filter_by(userid=userid_key).all()

        except Exception as e:
            return "no data", 400
    data = [r.__dict__ for r in results]
    for row in data:
        row.pop('_sa_instance_state', None)
    data = pd.DataFrame(data)
    response = ask_chatbot(user_query, data)
    print(response)
    return response

@app.route('/api/daily_qoute', methods=['POST'])
def qoute():
    try:
        with app.app_context():
            req = requests.get("https://zenquotes.io/api/today/[your_key]")
            data = req.json()
            data = data[0]
            print(req)
            print(data)
        return jsonify({"qoute": data["q"], "author" : data["a"]})
    except Exception as e:
        print(e)
        return jsonify({"qoute": "When running out of api requests, sometimes you must do things yourself", "author" : "Me"})


@app.route('/api/earning_report', methods=['POST'])
def earning_report():
    engine = db.engine
    session = Session(engine)

    try:
        results = session.query(Transaction).filter_by(userid=userid_key).all()

    except Exception as e:
        return "no data", 400
    print(results)
    data = [r.__dict__ for r in results]
    for row in data:
        row.pop('_sa_instance_state', None)
    data = pd.DataFrame(data)
    #last month
    data["date"] = pd.to_datetime(data["date"])
    current_date = datetime.datetime.now()
    timedelta = current_date - datetime.timedelta(days=30)
    data = data[data['date'] >= timedelta]

    df_earning = data[data["type"] == "credit"]
    earning = df_earning["amount"].sum()
    df_spending = data[data["type"] == "debit"]
    spending = df_spending["amount"].abs().sum()
    net = earning - spending

    return jsonify({"earning": earning, "spending": spending, "net": net})

@app.route('/api/recent_transactions', methods=['POST'])
def recent_transactions():
    engine = db.engine
    session = Session(engine)

    try:
        results = session.query(Transaction).filter_by(userid=userid_key).all()

    except Exception as e:
        return "no data", 400
    print(results)
    data = [r.__dict__ for r in results]
    for row in data:
        row.pop('_sa_instance_state', None)
    data = pd.DataFrame(data)

    data["date"] = pd.to_datetime(data["date"])
    data.sort_values("date", inplace=True)
    recent_data = data.head(10)

    return jsonify({recent_data})









if __name__ == '__main__':
    app.run(debug=True)

