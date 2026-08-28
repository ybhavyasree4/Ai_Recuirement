import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

try:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": "Say OK"}],
        max_tokens=100
    )

    print("GROQ WORKING" if response.choices[0].message.content else "GROQ NOT WORKING")

except Exception:
    print("GROQ NOT WORKING")