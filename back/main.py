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
    location: str
    price_range: str

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DOMAIN_API_KEY = os.getenv("DOMAIN_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set")
if not DOMAIN_API_KEY:
    raise ValueError("DOMAIN_API_KEY environment variable not set")
print(f"GROQ_API_KEY: {GROQ_API_KEY}")  # Debugging line
print(f"DOMAIN_API_KEY: {DOMAIN_API_KEY}")  # Debugging line

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DOMAIN_API_URL = "https://api.domain.com.au/v1/listings/residential/_search"
MODEL_ID = "mixtral-8x7b-32768"

def get_commbank_data():
    commbank_api_url = 'https://api.commbank.com.au/endpoint'  # Replace with the actual CommBank API endpoint

    headers = {
        'Authorization': f'Bearer {DOMAIN_API_KEY}',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.get(commbank_api_url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        return None
    except Exception as err:
        print(f"Other error occurred: {err}")
        return None

def get_domain_listings(location: str, price_range: str):
    headers = {
        'Authorization': f'Bearer {DOMAIN_API_KEY}',
        'Content-Type': 'application/json'
    }
    min_price, max_price = map(int, price_range.split('-'))
    data = {
        "listingType": "Sale",
        "minPrice": min_price,
        "maxPrice": max_price,
        "locations": [
            {
                "state": "NSW",  # Adjust based on your needs
                "suburb": location,
                "includeSurroundingSuburbs": True
            }
        ]
    }

    try:
        response = requests.post(DOMAIN_API_URL, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        return None
    except Exception as err:
        print(f"Other error occurred: {err}")
        return None

@app.post("/analyze")
async def analyze(prompt_request: PromptRequest):
    commbank_data = get_commbank_data()
    if commbank_data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch data from CommBank API")

    domain_data = get_domain_listings(prompt_request.location, prompt_request.price_range)
    if domain_data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch data from Domain API")

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
                f"Calculate and include the down payment capability, debt-to-income ratio, estimated monthly payment, possible credit score range, loan term options, and property price range. "
                f"Also provide a brief text analysis. The response should be in the following JSON format: "
                "{{"
                "\"analysis\": {{"
                "\"annualIncome\": {prompt_request.income},"
                "\"savings\": {prompt_request.savings},"
                "\"debt\": {prompt_request.debt},"
                "\"loanRecommendation\": \"[value]\","
                "\"potentialInterestRate\": \"[value]\","
                "\"overallFinancialHealth\": \"[value]\","
                "\"riskAssessment\": \"[value]\","
                "\"downPaymentCapability\": \"[value]\","
                "\"debtToIncomeRatio\": \"[value]\","
                "\"estimatedMonthlyPayment\": \"[value]\","
                "\"creditScoreRange\": \"[value]\","
                "\"loanTermOptions\": \"[value]\","
                "\"propertyPriceRange\": \"[value]\""
                "}},"
                "\"textAnalysis\": \"[text analysis]\""
                "}},"
                f"CommBank data: {commbank_data}, Domain data: {domain_data}"
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
