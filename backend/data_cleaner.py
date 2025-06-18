from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import pandas as pd

def batch_standardize(df, batch_size=100):
    results = []
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i+batch_size]
        try:
            cleaned = standardize_csv(batch)
            results.append(cleaned)
        except Exception as e:
            print(f"Error in batch {i // batch_size + 1}: {e}")
    return pd.concat(results, ignore_index=True)


load_dotenv()
def standardize_csv(csv_sample_data: pd.DataFrame):
    from pydantic import BaseModel
    from typing import List, Literal

    class TransactionRecord(BaseModel):
        date: str
        description: str
        amount: float
        type: Literal["credit", "debit"]

    class StandardizedCSV(BaseModel):
        transactions: List[TransactionRecord]

    csv_sample_data = csv_sample_data.to_dict(orient="records")


    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")  # or gemini-2.0-flash if supported

    parser = PydanticOutputParser(pydantic_object=StandardizedCSV)

    system_prompt = """
    You are a financial data assistant. Your task is to standardize raw bank transaction records into the following exact JSON format:

{{
  "transactions": [
    {{
      "date": "YYYY-MM-DD",              # ISO 8601 format
      "description": "brief summary",    # A concise description of the transaction
      "amount": float,                   # Positive for credits, negative for debits
      "type": "credit" or "debit"        # Indicates the transaction type
    }},
    ...
  ]
}}

Instructions:

- **Map or rename columns** directly to the above format whenever possible.
- If necessary, **infer or compute missing values** (e.g., derive `amount` from separate credit/debit columns).
- **Remove unnecessary or unrelated columns.**
- **Standardize dates** to the YYYY-MM-DD format.
- Use **positive values** for credits, and **negative values** for debits.
- **Correct malformed or invalid rows** if they can be reasonably inferred; otherwise, exclude them.
- Your output must be **strictly valid JSON**, matching the schema above exactly.
- Wrap the list of transactions in the top-level `"transactions"` key, as shown.

Return only the JSON. Do not include any explanation or extra text.
    """


    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "Here are some transaction records: {input_data}")
        ]
    ).partial(format_instructions=parser.get_format_instructions())

    chain = prompt | llm | parser

    response = chain.invoke({"input_data": csv_sample_data})
    print("raw response: " , response)
    response = pd.DataFrame([t.model_dump() for t in response.transactions])

    return response

