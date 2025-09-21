from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
from typing import Dict, Any, List
import json
from datetime import datetime
import openai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
openai.api_key = os.getenv("OPENAI_API_KEY")

class AnalysisRequest(BaseModel):
    name: str
    description: str
    employeeCount: int
    location: str
    businessModel: str | None = None
    targetMarket: str | None = None
    landType: str | None = None
    landArea: float | None = None

class ADKRequest(BaseModel):
    app_name: str
    user_id: str
    session_id: str
    new_message: Dict[str, Any]
    streaming: bool = False

def generate_market_analysis(prompt: str) -> str:
    try:
        completion = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a market research and business analysis expert specializing in agricultural technology and startups."},
                {"role": "user", "content": prompt}
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error generating analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate analysis")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/run")
async def run_analysis(request: ADKRequest):
    try:
        # Extract the analysis request from the message
        message_text = request.new_message["parts"][0]["text"]
        
        # Generate analysis using OpenAI
        analysis_text = generate_market_analysis(message_text)
        
        # Format the response as ADK events
        current_time = datetime.utcnow().isoformat()
        events = [{
            "id": "evt_1",
            "timestamp": current_time,
            "author": "assistant",
            "content": {
                "parts": [{"text": analysis_text}],
                "role": "assistant"
            }
        }]
        
        return events
    except Exception as e:
        print(f"Error in run_analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    try:
        port = int(os.getenv("PORT", "8080"))
        print(f"Starting server on http://127.0.0.1:{port}")
        print("OpenAI API Key configured:", "Yes" if openai.api_key else "No")
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
    except Exception as e:
        print(f"Failed to start server: {e}")
        raise