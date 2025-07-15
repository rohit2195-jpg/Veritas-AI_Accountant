# Veritas-AI_Accountant

## 🧾 Overview

This application helps individuals and companies track, visualize, and analyze their personal or organizational spending using emerging technologies like AI.

### ✨ Key Features
- CSV ingestion for transaction data
- SQL-backed storage with Python/Pandas
- AI-based categorization of transactions using Gemini 2.0 Flash
- Custom + standard category tagging
- Visual dashboards built with Chart.js
- Conversational AI for querying data using RAG (Pandas code generation)
- Secure login/signup using Firebase Authentication

---

## 💻 Technologies Used

| Layer       | Stack                                                                |
|-------------|----------------------------------------------------------------------|
| **Frontend** | React, TypeScript, Chart.js                                          |
| **Backend**  | Python, Flask, Firebase Admin SDK                                   |
| **AI/LLM**   | Gemini 2.0 Flash (via LangChain), Retrieval-Augmented Generation    |
| **Database** | SQL (via SQLAlchemy), Pandas, Numpy                                  |
| **Auth**     | Firebase Authentication                                              |

---

## 🚧 Future Plans
In the future, I'd like to add the ability to...
- Generate downloadable PDF reports 
- Performance improvements and bug fixes
- Public hosting and deployment
- Add Login with Google, Facebook, Github

---

## 🌐 Hosting & Setup

This app is not hosted publicly yet. You can run it locally with the steps below.

---

### 🔧 Prerequisites

- Python 
- Node.js
- npm
- Firebase account
- Google Cloud project (for Gemini API key)

---

### 📁 1. Clone & Setup

```bash
git clone https://github.com/your-username/Veritas-AI_Accountant.git
cd Veritas-AI_Accountant
```
### 2. Backend Setup 

- Prepare an SQL database (locally or on AWS)

- Use the info to fill ".env-copy" 

- Add your Gemini API key
- rename to .env
    
- Start the database
#### 3. Setup Firebase Auth

   - Setup a new project, generate the service account keys, and downlaod the json file.

   - In the backend, Copy the contents of the json and paste it into veritas-ai-accountant-firebase-adminsdk-fbsvc-92ad95b9f2-COPY.json
    
   - Rename the file to veritas-ai-accountant-firebase-adminsdk-fbsvc-92ad95b9f2.json
   
   - In the frontend, update firebase-config.ts with the Firebase configuration object/ SDK snipped provided by Firebase

#### 4. Setup the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python backend.py

```

### 3. Frontend Setup
```angular2html
cd frontend
npm install
npm run dev

```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

