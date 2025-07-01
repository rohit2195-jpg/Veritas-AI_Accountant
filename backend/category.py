from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import pandas as pd
import json
model_str = "gemini-1.5-flash"
def batch_categorize(df,categories, batch_size=50):
    results = []
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i+batch_size]
        try:
            cleaned = standardize_csv(batch, categories)
            print(cleaned)
            results.append(cleaned)
        except Exception as e:
            print(f"Error in batch {i // batch_size + 1}: {e}")
    return pd.concat(results, ignore_index=True)


load_dotenv()
def standardize_csv(csv_sample_data: pd.DataFrame, categories):
    from pydantic import BaseModel
    from typing import List, Literal

    class TransactionRecord(BaseModel):
        date: str
        description: str
        amount: float
        type: Literal["credit", "debit"]
        category: str
        userid: int

    class StandardizedCSV(BaseModel):
        transactions: List[TransactionRecord]

    csv_sample_data = csv_sample_data.to_dict(orient="records")


    llm = ChatGoogleGenerativeAI(model=model_str)  # or gemini-2.0-flash if supported

    parser = PydanticOutputParser(pydantic_object=StandardizedCSV)

    system_prompt = system_prompt = """
You are a financial data assistant. Your job is to categorize a list of bank transactions using a given list of predefined categories.

Here are the available categories, each with a name and optional notes describing what it includes:
ONLY use these given categories:
{categories}

Each transaction should be mapped to the most appropriate category based on the `description` field and the notes provided above.
You are allowed to make inferences to find the category that best fits the transaction description.
You are only allowed to choose categories based on the categories given to you.
Category must always be assigned and cannot be empty or null.

The output should be in the following strict JSON format:

{{
  "transactions": [
    {{
      "date": "YYYY-MM-DD",              // ISO 8601 format
      "description": "brief summary",    // A concise description of the transaction
      "amount": float,                   // Positive for credits, negative for debits
      "type": "credit" or "debit",       // Indicates the transaction type
      "category": "CategoryName"         // Category name selected from the list above
      "userid" : "ID of the User"        // Should not be changed
    }},
    ...
  ]
}}

### Rules:
- Only assign categories that are present in the list above.
- Match transactions to the **closest-fitting** category based on context and keywords.
- Do **not** invent new categories.
- Skip rows that are malformed or lack essential fields.
- Return **only** valid JSON that conforms to the format above.
"""

    categories_str = json.dumps(categories, indent=2)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "Here are some transaction records: {input_data}")
        ]
    ).partial(
        categories=categories_str,
        format_instructions=parser.get_format_instructions()
    )

    chain = prompt | llm | parser

    response = chain.invoke({"input_data": csv_sample_data})
    print("raw response: " , response)
    response = pd.DataFrame([t.model_dump() for t in response.transactions])

    return response

# this is categorization for a slightly different format

def batch_categorize2(df,categories, batch_size=50):
    results = []
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i+batch_size]
        try:
            cleaned = standardize_csv2(batch, categories)
            print(cleaned)
            results.append(cleaned)
        except Exception as e:
            print(f"Error in batch {i // batch_size + 1}: {e}")
    return pd.concat(results, ignore_index=True)


def standardize_csv2(csv_sample_data: pd.DataFrame, categories):
    from pydantic import BaseModel
    from typing import List, Literal

    class TransactionRecord(BaseModel):
        date: str
        description: str
        amount: float
        type: Literal["credit", "debit"]
        category: str
        userid: int
        id: int

    class StandardizedCSV(BaseModel):
        transactions: List[TransactionRecord]

    csv_sample_data = csv_sample_data.to_dict(orient="records")


    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")  # or gemini-2.0-flash if supported

    parser = PydanticOutputParser(pydantic_object=StandardizedCSV)

    system_prompt = system_prompt = """
You are a financial data assistant. Your job is to categorize a list of bank transactions using a given list of predefined categories.

Here are the available categories, each with a name and optional notes describing what it includes:
ONLY use these given categories:
{categories}

Each transaction should be mapped to the most appropriate category based on the `description` field and the notes provided above.
You are allowed to make inferences to find the category that best fits the transaction description.
You are only allowed to choose categories based on the categories given to you.
Category must always be assigned and cannot be empty or null.

The output should be in the following strict JSON format:

{{
  "transactions": [
    {{
      "date": "YYYY-MM-DD",              // ISO 8601 format
      "description": "brief summary",    // A concise description of the transaction
      "amount": float,                   // Positive for credits, negative for debits
      "type": "credit" or "debit",       // Indicates the transaction type
      "category": "CategoryName"         // Category name selected from the list above
      "userid" : "ID of the User"        // Should not be changed
      "id" : "ID of the Transaction"     // Should not be changed
    }},
    ...
  ]
}}

### Rules:
- Only assign categories that are present in the list above.
- Match transactions to the **closest-fitting** category based on context and keywords.
- Do **not** invent new categories.
- Skip rows that are malformed or lack essential fields.
- Return **only** valid JSON that conforms to the format above.
"""

    categories_str = json.dumps(categories, indent=2)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "Here are some transaction records: {input_data}")
        ]
    ).partial(
        categories=categories_str,
        format_instructions=parser.get_format_instructions()
    )

    chain = prompt | llm | parser

    response = chain.invoke({"input_data": csv_sample_data})
    print("raw response: " , response)
    response = pd.DataFrame([t.model_dump() for t in response.transactions])

    return response

