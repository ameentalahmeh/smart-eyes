from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv
from stt import create_stt, get_stt
from itt import analyze_image
import time
import base64

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    logger.info("Health check endpoint called")
    return jsonify({"status": "healthy"}), 200

@app.route('/api/stt', methods=['POST']) 
def speech_to_text():
    try:
        logger.info("Speech to text endpoint called")
        
        if not request.is_json:
            logger.error("Unsupported content type")
            return jsonify({"error": "Please send audio as base64 in JSON"}), 415

        logger.debug("Received audio data, processing...")    
        
        data = request.get_json()
        r_audio_data = data.get('audio')
        if not r_audio_data:
            raise KeyError('audio')

        lang = data.get('lang', 'en-US')
        logger.debug(f"Language set to: {lang}")

        # Convert the base64 string back to audio file
        audio_data = base64.b64decode(r_audio_data)

        # Send the audio data to the STT API
        stt_response = create_stt(audio_data, lang)
        logger.debug(f"STT response: {stt_response}")
        if stt_response is None:
            logger.error("No response from STT API")
            return jsonify({"error": "No response from STT API"}), 500
        gen_id = stt_response.get("generation_id")
        logger.info(f"Generated STT ID: {gen_id}")

        if gen_id:
            start_time = time.time()
            timeout = 600  # 10 minutes
            
            while time.time() - start_time < timeout:
                logger.debug(f"Checking STT status for ID: {gen_id}")
                response_data = get_stt(gen_id)

                if response_data is None:
                    logger.error("No response from API")
                    return jsonify({"error": "No response from API"}), 500
                
                status = response_data.get("status")
                logger.debug(f"Current status: {status}")

                if status in ["waiting", "active"]:
                    logger.info("Processing in progress, waiting 10 seconds")
                    time.sleep(10)
                else:
                    logger.info(f"Processing complete with status: {status}")
                    logger.debug(f"Response data: {response_data}")

                    transcript = response_data["result"]['results']["channels"][0]["alternatives"][0]["transcript"]
                    logger.info(f"Transcript: {transcript}")
                    return jsonify({"transcript": transcript})
    
            logger.warning("Timeout reached for STT processing")
            return jsonify({"error": "Processing timeout"}), 408
        else:
            logger.error("No generation ID received")
            return jsonify({"error": "Failed to generate STT ID"}), 500
    except KeyError as e:
        logger.error(f"Missing key in request: {str(e)}")
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        logger.exception("Unexpected error in speech_to_text")
        return jsonify({"error": str(e)}), 500

@app.route('/api/itt', methods=['POST'])
def image_to_text():
    try:
        logger.info("Image to text endpoint called")
        
        if not request.is_json:
            logger.error("Unsupported content type")
            return jsonify({"error": "Please send image as base64 in JSON"}), 415

        logger.debug("Received image data, processing...")    
        
        data = request.get_json()
        image = data.get('image')
        if not image:
            raise KeyError('image')

        # Send the image data to the ITT API
        itt_response = analyze_image(image)
        if itt_response is None:
            logger.error("No response from ITT API")
            return jsonify({"error": "No response from ITT API"}), 500

        logger.debug(f"ITT response: {itt_response}")

        analysis = itt_response["choices"][0]["message"]["content"]
        logger.debug(f"Image Analysis: {analysis}")
        return jsonify({"analysis": analysis})
    except KeyError as e:
        logger.error(f"Missing key in request: {str(e)}")
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        logger.exception("Unexpected error in image_to_text")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    logger.info(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
