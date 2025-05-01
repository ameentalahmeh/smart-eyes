import os
import requests
import json
import random
import logging

base_url = "https://api.aimlapi.com"
api_key = os.getenv("API_KEY")


MODELS = [
    # OpenAI GPT-4o and GPT-4 turbo (strongest, multimodal, best vision)
    "gpt-4o-2024-08-06",
    "gpt-4o-2024-05-13",
    "gpt-4o",
    "gpt-4o-latest",
]

logger = logging.getLogger(__name__)

# Description: This module provides functionality to analyze images using the AIMLAPI service.
# It defines a function `analyze_image` that sends a base64-encoded image to the API
# and returns a description of the scene, useful for accessibility purposes.
def analyze_image(base64_image):
    url = f"{base_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}", 
    }

    prompt="Describe the scene for a blind user."

    payload = {
        "model": random.choice(MODELS),
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.json()
