import datetime

from flask import Flask, request, jsonify, session, send_file
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
import io




load_dotenv()
userid = 12
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
    engine = db.engine

    try:
        pref = db.session.get(Preferences, userid_key)
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        db.session.close()
    return pref.categories

@app.route('/uploadcsv', methods=['POST'])
def upload_csv():
    engine = db.engine

    if 'filename' not in request.files:
        return "error", 400
    file = request.files['filename']
    categories = request.form['categories']
    if file.filename == '':
        return jsonify({'error': 'No file found'}), 400


    filename = secure_filename(file.filename)
    file_path = os.path.join(".", "uploads", filename)
    file.save(file_path)

    try:
        standard_columns = ['date', 'description', 'amount', 'balance']

        df = pd.read_csv(file_path)


        standardized_df = df
        #standardized_df = batch_standardize(df)

        sameCategories = True
        # check is it the same categoires form the dataset
        standardized_df["userid"] = userid
        db.create_all()


        pref = db.session.get(Preferences, userid)
        if not pref:
            pref = Preferences(userid=userid, categories=categories)
            db.session.add(pref)
            db.session.commit()

        #same categories - easy
        if categories == pref.categories:
            standardized_df = batch_categorize(standardized_df, categories)


            standardized_df.to_sql('transaction', con=engine, if_exists='append', index=False)
            #upload it to exisiting dataset
        else:
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
            transaction_data = batch_categorize2(transaction_data, categories)
            for t in transaction:
                new_category = transaction_data.loc[transaction_data["id"] == t.id, "category"].values[0]
                t.category = new_category
            db.session.commit()


            standardized_df = batch_categorize(standardized_df, categories)

            standardized_df.to_sql('transaction', con=engine, if_exists='append', index=False)


        pref = db.session.get(Preferences, userid)

        standardized_df.to_csv("temp.csv", index=False)
    except Exception as e:
        print(f"Error reading or processing file: {e}")

    finally:
        '''
        if os.path.exists(file_path):
            os.remove(file_path)
        '''
        db.session.remove()
        return jsonify({'filename': filename}), 200

@app.route('/view_transactions', methods=['POST'])
def hello():
    engine = db.engine

    try:
        results = db.session.query(Transaction).filter_by(userid=userid_key).all()
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500
    data = [r.__dict__ for r in results]
    for row in data:
        row.pop('_sa_instance_state', None)
    df = pd.DataFrame(data)
    df.drop("userid", axis=1, inplace=True)
    db.session.remove()
    return jsonify(df.to_dict(orient='records'))


#Dashboard charts
@app.route('/api/expensesby-category', methods=['POST'])
def expenses_by_category():
    engine = db.engine

    try:
        results = db.session.query(Transaction).filter_by(userid=userid_key).all()
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500
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
    db.session.remove()

    return jsonify({
        "labels": res.index.tolist(),
        "datasets": [
            {
                "data": res.values.tolist(),
                "backgroundColor": colors[:len(res)]
            }
        ],

    })

@app.route('/api/timegraphs', methods=['POST'])
def time_graphs():
    engine = db.engine

    try:
        results = db.session.query(Transaction).filter_by(userid=userid_key).all()

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500
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

    db.session.remove()

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
    engine = db.engine

    try:
        results = db.session.query(Transaction).filter_by(userid=userid_key).all()

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500
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

    db.session.remove()

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

        try:
            results = db.session.query(Transaction).filter_by(userid=userid_key).all()

        except Exception as e:
            print("Error:", e)
            return jsonify({"error": str(e)}), 500
    data = [r.__dict__ for r in results]
    for row in data:
        row.pop('_sa_instance_state', None)
    data = pd.DataFrame(data)
    response = ask_chatbot(user_query, data)
    db.session.remove()
    return response

@app.route('/api/daily_qoute', methods=['POST'])
def getQoute():
    file = open('qoute.txt', 'r')
    content = file.readlines()
    for i in range(len(content)):
        content[i] = content[i].strip()
    curr_date = datetime.date.today()
    if content:
        qoute_date = datetime.datetime.strptime(content[2], "%Y-%m-%d").date()
        qoute = content[0]
        author = content[1]
    file.close()

    if not content or qoute_date < curr_date:
        #update or change qoute
        try:
            with app.app_context():
                req = requests.get("https://zenquotes.io/api/today/[your_key]")
                data = req.json()
                data = data[0]
                qoute = data["q"]
                author = data["a"]


                w = open('qoute.txt', 'w')
                w.write(qoute + "\n")
                w.write(author + "\n")
                w.write(str(curr_date))
                w.close()
                return jsonify({"qoute":qoute,  "author" : author})

        except Exception as e:
            print(e)

    else:
        return jsonify({"qoute": content[0], "author" : content[1]})


@app.route('/api/earning_report', methods=['POST'])
def earning_report():
    engine = db.engine

    try:
        results = db.session.query(Transaction).filter_by(userid=userid_key).all()

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500
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

    db.session.remove()
    return jsonify({"earning": earning, "spending": spending, "net": net})

@app.route('/api/recent_transactions', methods=['POST'])
def recent_transactions():
    engine = db.engine

    try:
        results = db.session.query(Transaction).filter_by(userid=userid_key).all()

    except Exception as e:
        return "no data", 400
    data = [r.__dict__ for r in results]
    for row in data:
        row.pop('_sa_instance_state', None)
    data = pd.DataFrame(data)

    data["date"] = pd.to_datetime(data["date"])
    data.sort_values("date", inplace=True)
    recent_data = data.tail(10)

    db.session.remove()

    return jsonify(recent_data.to_dict(orient='records'))



@app.route('/api/clear_transactions', methods=['POST'])
def clear_transactions():
    engine = db.engine
    try:
        transactions = db.session.query(Transaction).filter_by(userid=userid_key).all()

        for t in transactions:
            db.session.delete(t)
    except Exception as e:
        db.session.remove()
        print("Error:", e)
        return jsonify({"error": str(e)}), 500
    db.session.commit()
    db.session.remove()
    return jsonify({})

@app.route('/api/download_transactions', methods=['POST'])
def download_transactions():
    engine = db.engine
    try:
        results = db.session.query(Transaction).filter_by(userid=userid_key).all()
        data = [r.__dict__ for r in results]
        for row in data:
            row.pop('_sa_instance_state', None)
        data = pd.DataFrame(data)
        data = data[['date', 'description', 'amount', 'type']]
        data.to_csv("transactions.csv", index=False)

        buffer = io.StringIO()
        data.to_csv(buffer, index=False)
        buffer.seek(0)
        return send_file(
            io.BytesIO(buffer.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name='transactions.csv'
        )


    except Exception as e:
        db.session.remove()
        print("Error:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        db.session.remove()





if __name__ == '__main__':
    app.run(debug=True)

