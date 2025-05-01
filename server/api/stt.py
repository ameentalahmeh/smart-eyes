import os
import requests
import random
import logging

base_url = "https://api.aimlapi.com/v1"
api_key = os.getenv("API_KEY")

MODELS = [
    "#g1_whisper-base"
]


logger = logging.getLogger(__name__)

# Creating and sending a speech-to-text conversion task to the server
def create_stt(file, language):
    url = f"{base_url}/stt/create"
    headers = {
        "Authorization": f"Bearer {api_key}", 
    }

    data = {
        "model": random.choice(MODELS),  # Randomly select a model
        "language": language,
    }

    logger.debug(f"Sending STT request with data: {data}")

    # The audio file to be converted to text
    files = {"audio": ("audio.wav", file, "audio/wav")}
    response = requests.post(url, data=data, headers=headers, files=files)

    if response.status_code >= 400:
        print(f"Error: {response.status_code} - {response.text}")
    else:
        response_data = response.json()
        return response_data

# Requesting the result of the task from the server using the generation_id
def get_stt(gen_id):
    url = f"{base_url}/stt/{gen_id}"
    headers = {
        "Authorization": f"Bearer {api_key}", 
    }
    response = requests.get(url, headers=headers)
    return response.json()
