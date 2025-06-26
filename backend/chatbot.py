import os

from dotenv import load_dotenv
from google import genai
import pandas as pd

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=API_KEY)
model = "gemini-2.5-flash"


def clean_llm_code(code: str) -> str:
    code = code.strip()
    if code.startswith("```"):
        code = code.split("```")[1] if "```" in code else code
    code = code.replace("python", "").replace("```", "").strip()
    return code


def ask_chatbot(user_query, df):
    llm_code = ask_gemini_for_code(user_query, df.head().to_string(index=False))
    exec_globals = {"df": df, "pd":pd}
    try:
        llm_code = clean_llm_code(llm_code)
        print("cleaned code, llm_code:", llm_code)
        exec(llm_code, exec_globals)
        result =  exec_globals.get("result")
        result_text = str(result)

        response = ask_gemini_for_analysis(user_query, result_text)
    except Exception as e:
        print("error", e)
        response = f"Sorry, I couldn't analyze your data due to an internal error: {str(e)}"

    print(response)
    return response


def ask_gemini_for_code(question, df):
    df_preview = df
    prompt = f"""
    You are a Python data assistant. You ONLY WRITE PYTHON CODE.
    The DataFrame is called "df".
    Here is a sample of the user's transaction data:
    
    {df_preview}
    
    User question: "{question}"
    
    Generate safe and correct **pandas code** to answer the question. Do not run the code.
    Please return only pandas code that assigns the final answer to a variable named `result`.
    Do not print or return — just assign it to `result`, so it can be accessed from code.
    If a particular question can be answered without the dataframe of transactions, then you don't need to do anything.

    Only output code, not explanations.
    """
    response = client.models.generate_content(model = model, contents = prompt)
    if not response.text:
        return
    return response.text.strip()
def ask_gemini_for_analysis( question, result):
    prompt = f"""
    You are a professional, empathetic, and highly knowledgeable financial assistant.

Your job is to help users deeply understand their financial behavior and data by interpreting analysis results. You should go far beyond simply restating the numbers — instead, deliver thoughtful, well-organized, and insightful responses that feel like speaking to a smart and caring human financial advisor.

🧠 Instructions:
- Take the user’s question and the result, and generate a **rich, multi-paragraph response** that gives:
    1. A clear, human-friendly interpretation of the result.
    2. Insightful commentary: what might explain this pattern or behavior?
    3. Possible financial implications or risks (if any).
    4. Helpful advice, strategies, or behavioral tips.
    5. Optional follow-ups or things the user might want to track next.
    - Be empathetic and supportive — money is personal.
    - You may use light formatting like bullet points or short lists to improve clarity.
    - DO NOT write or suggest code.
    - DO NOT include raw data, numbers, or printouts beyond the final result.
    - DO NOT say "the result is..." — speak naturally, like a human assistant giving guidance.
    
    ---
    
    User question:
    "{question}"
    
    Analysis result:
    "{result}"
    
    ---
    
    📣 Based on the above, give a **complete, thoughtful, and human-friendly explanation**. Be clear, conversational, and thorough.




    """
    response = client.models.generate_content(model = model, contents = prompt)
    return response.text.strip()




