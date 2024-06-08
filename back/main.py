from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str
    income: float
    savings: float
    debt: float

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set")
print(f"GROQ_API_KEY: {GROQ_API_KEY}")  # Debugging line

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_ID = "mixtral-8x7b-32768"

@app.post("/analyze")
async def analyze(prompt_request: PromptRequest):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL_ID,
        "messages": [
            {"role": "system", "content": "You are an AI assistant specialized in real estate investment analysis. Provide the response in JSON format."},
            {"role": "user", "content": (
                f"Analyze the following financial data and provide a detailed analysis as a JSON object: "
                f"Annual income: ${prompt_request.income}, Savings: ${prompt_request.savings}, Debt: ${prompt_request.debt}. "
                f"Consider the user's ability to obtain a loan, potential interest rate, and overall financial health. "
                f"Also provide a brief text analysis. The response should be in the following JSON format: "
                "{"
                "\"analysis\": {"
                "\"annualIncome\": \"[value]\","
                "\"savings\": \"[value]\","
                "\"debt\": \"[value]\","
                "\"loanRecommendation\": \"[value]\","
                "\"potentialInterestRate\": \"[value]\","
                "\"overallFinancialHealth\": \"[value]\","
                "\"riskAssessment\": \"[value]\""
                "},"
                "\"textAnalysis\": \"[text analysis]\""
                "}"
            )}
        ],
        "response_format": {"type": "json_object"}
    }

    response = requests.post(GROQ_API_URL, headers=headers, json=data)

    if response.status_code != 200:
        print(response.text)  # Print the error response for debugging
        raise HTTPException(status_code=response.status_code, detail=response.json())

    analysis = response.json()
    return analysis

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
