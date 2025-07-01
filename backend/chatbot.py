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

Your role is to help users understand their financial behavior and data based on a computed result derived from their question.

---

What you have:
- User question: "{question}"
- Computation result: "{result}"

---

🧠 Your task:
Interpret the result as if the user has **not yet seen it**. Do **not** assume they know the outcome.

---

🎯 Instructions:
- Begin by **clearly summarizing the key insight** from the result — explain it in simple, accessible terms.
- Then provide a **human-friendly explanation** of what it means in context.
- Avoid phrases like “That’s great news!” or “As you can see” — because the user has **not seen** the result.
- Provide statistics from the computation result when applicable and integrate it into your response smoothly
- Offer helpful analysis and insight:
    1. What does the result suggest about their financial behavior?
    2. What might be driving this trend?
    3. Are there any risks or areas for improvement?
    4. Offer constructive suggestions or behavioral tips.
    5. Optionally, suggest a follow-up question or data they might want to track.

✅ Do NOT include:
- Any raw data or variable names
- Any code
- Any mention of data being “above” or “already visible” to the user
- Any patronizing or overly enthusiastic language — stay warm and professional

---

Write a complete, thoughtful, and natural response that sounds like a smart human advisor helping someone with their money.

"""
    response = client.models.generate_content(model = model, contents = prompt)
    return response.text.strip()




