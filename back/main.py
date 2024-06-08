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
    suburb: str

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

    # Log the suburb and prompt
    print(f"Suburb: {prompt_request.suburb}")
    print(f"Prompt: {prompt_request.prompt}")

    # Assume these calculations are placeholders for actual logic
    loan_amount = (prompt_request.income - prompt_request.debt) * 4
    total_project_cost = loan_amount + prompt_request.savings
    interest_rate = 4.5  # Example static rate
    monthly_repayment = (loan_amount * (interest_rate / 100)) / 12
    cost_variation = total_project_cost * 0.1

    data = {
        "model": MODEL_ID,
        "messages": [
            {"role": "system", "content": "You are an AI assistant specialized in real estate investment analysis. Provide the response in JSON format."},
            {"role": "user", "content": (
                f"Analyze the following financial data and project description, and provide a detailed analysis as a JSON object: "
                f"Project description: {prompt_request.prompt} in {prompt_request.suburb}. Take into deep consideration the suburb given here as project costs vary heavily based off of it.\n"
                f"Annual income: ${prompt_request.income}, Savings: ${prompt_request.savings}, Debt: ${prompt_request.debt}. "
                f"Calculate the loan amount the user can achieve with their financials, as well as the total project cost, annual interest rate, monthly repayments (assuming a 30-year loan), and the potential cost variation. All relevant values should be in $'s."
                f"Also provide a specific outline of applications the investor might need to take with the local council in {prompt_request.suburb} (which will be given to you in the suburb value, assume the state from this suburb) (Australian) which will be defined. Identify which state or city the user is in to determine what legislations relate to their situation and any approvals they need to build this project. Do not give them an ambiguous recommendation like 'Talk to your local council' or 'Comply Fire and Safety Standards', you need to define the specific application they must complete and if you don't know don't say it. The format for the council regulations field should be succinct and to the point, in ONLY DOT POINTS."
                f"The response should be in the following JSON format: "
                "{{"
                "\"analysis\": {{"
                "\"annualIncome\": {prompt_request.income},"
                "\"savings\": {prompt_request.savings},"
                "\"debt\": {prompt_request.debt},"
                "\"loanAmount\": {loan_amount},"
                "\"totalProjectCost\": {total_project_cost},"
                "\"annualInterestRate\": \"{interest_rate}%\","
                "\"monthlyRepayment\": {monthly_repayment},"
                "\"costVariation\": {cost_variation},"
                "\"loanRecommendation\": \"[value]\","
                "\"potentialInterestRate\": \"{interest_rate}%\","
                "\"overallFinancialHealth\": \"[value]\","
                "\"riskAssessment\": \"[value]\""
                "}},"
                "\"textAnalysis\": \"[text analysis]\","
                "\"councilRegulations\": \"- [regulation 1]\\n- [regulation 2]\\n- [regulation 3]\""
                "}}"
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
