# app.py
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
# import sqlite3
from dotenv import load_dotenv
from .agent import Agent
import logging
import threading
from queue import Queue
from groq import Groq
# import chromadb
# from chromadb.config import Settings
import re
import shutil
import uuid
# from sqlalchemy import create_engine
# from sqlalchemy.orm import scoped_session, sessionmaker
import asyncio

load_dotenv('.env.local')

logging.basicConfig(level=logging.INFO)

OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL')
MODEL_NAME = os.getenv('MODEL_NAME', 'llama3')  # Add a default value

BASE_DIR = 'user_data'
# CHROMA_DIR = os.path.join(BASE_DIR, f'chroma_db_{uuid.uuid4()}')
# DB_PATH = os.path.join(BASE_DIR, 'local_db.sqlite')

UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx'}

# Clear existing Chroma database
# if os.path.exists(CHROMA_DIR):
#     shutil.rmtree(CHROMA_DIR)
# os.makedirs(CHROMA_DIR, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize ChromaDB with PersistentClient
# chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)

# Create a collection for personas
# persona_collection = chroma_client.get_or_create_collection(name="personas")

# engine = create_engine(f'sqlite:///{DB_PATH}')
# db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Create an event loop
loop = asyncio.get_event_loop()

# Use the event loop to create the agent
agent = loop.run_until_complete(Agent.create("MainAgent", OLLAMA_BASE_URL, MODEL_NAME))

app = Flask(__name__)

# Configure CORS
if os.environ.get('FLASK_ENV') == 'production':
    # In production, allow requests from your Vercel domain
    CORS(app, resources={r"/*": {"origins": ["https://tcard.vercel.app", "http://localhost:3000"]}})
else:
    # In development, allow requests from the local frontend
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.after_request
def after_request(response):
    if os.environ.get('FLASK_ENV') == 'production':
        response.headers.add('Access-Control-Allow-Origin', 'https://tcard.vercel.app')
    else:
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['db_session'] = db_session

# In-memory storage for personas
personas = {}

@app.route('/generate_persona_stream', methods=['POST'])
def generate_persona_stream():
    app.logger.info("Received request for generate_persona_stream")
    data = request.form
    app.logger.info(f"Received data: {data}")
    
    # Construct the input text from the received data
    input_text = "\n".join([f"{key}: {', '.join(data.getlist(key)) if '[]' in key else data.get(key)}" for key in data.keys() if key != 'generation_settings'])
    
    app.logger.info(f"Constructed input text: {input_text}")
    
    generation_settings = json.loads(data.get('generation_settings', '{}'))
    
    api_key = generation_settings.get('api_key') or os.environ.get("GROQ_API_KEY")
    model = generation_settings.get('model', 'llama3-8b-8192')
    creativity = float(generation_settings.get('creativity', 0.5))
    realism = float(generation_settings.get('realism', 0.5))
    custom_prompt = generation_settings.get('default_prompt', '')
    
    system_prompt = """You are an AI assistant specializing in creating tailored professional profile cards. Generate a profile card based on the provided information about the job seeker, you will not respond in any other way than the format outlined below seperated by commas for each quality you extract and imagine. Use the given data to create a complete profile, being creative in extracting relevant skills and traits. Structure the card using the following format:
- Name: [Full Name]
- Summary: [A creative and insightful 2-3 sentence summary of the person's profile, highlighting their unique qualities and potential. Do not use the word "profile" in the summary, and do not just state what was provided in the input text, think of the bigger picture and their goals and how they want/need to percieve themselves]
</PersonalInfo>
<QualificationsAndEducation>
- [Most relevant qualification]
- [Educational background]
- [Additional certifications]
</QualificationsAndEducation>
<Skills>
- [Key technical skill]
- [Transferable skill 1]
- [Transferable skill 2]
- [Unique skill]
</Skills>
<Goals>
- [Primary career goal]
- [Secondary goal]
- [Personal development goal]
</Goals>
<Strengths>
- [Core strength 1]
- [Core strength 2]
- [Unique strength]
</Strengths>
<LifeExperiences>
- [Most relevant experience]
- [Character-building experience]
- [Unique life experience]
</LifeExperiences>
<ValueProposition>
- [Key value 1]
- [Key value 2]
- [Unique selling point]
</ValueProposition>
<NextSteps>
- [Immediate action item]
- [Medium-term goal]
- [Long-term aspiration]
</NextSteps>
Be creative and insightful in interpreting the provided information. Draw connections between the job seeker's current experiences and their career goals. Highlight transferable skills and unique strengths that could aid in their career transition. Prioritize qualities that apply well to their goal and are most important for their desired career path"""

    input_prompt = f"""
Create a professional profile card for a job seeker using the following information. Be creative and insightful in extracting relevant skills, traits, and potential connections from their current experiences to their new career goals:
{input_text}
 Adhere to the structure outlined in the system prompt, ensuring all relevant information is included and formatted appropriately. If a section lacks direct information, creatively infer potential points based on the overall profile. Focus on highlighting the most transferable and relevant qualities for the person's career goals. Use bullet points within each section to list items. If you dont have enough information to fill the section as much as possible, create/extract similar and relevant skills and information that are relevant to their goal. Do not use the word "profile" in the summary, and do not just state what was provided in the input text, think of the bigger picture and their goals and how they want/need to percieve themselves"""

    app.logger.info(f"Constructed input prompt: {input_prompt}")

    try:
        client = Groq(api_key=api_key)
        app.logger.info(f"Using API key: {api_key[:5]}...{api_key[-5:]}")
        app.logger.info(f"Using model: {model}")

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": input_prompt
                }
            ],
            model=model,
            temperature=creativity,
            max_tokens=7000,
            top_p=realism,
            stream=True
        )

        generated_persona = ''
        for chunk in chat_completion:
            if chunk.choices[0].delta.content is not None:
                generated_persona += chunk.choices[0].delta.content

        app.logger.info(f"Generated persona: {generated_persona[:500]}...")  # Log first 500 characters
        parsed_data = parse_generated_persona(generated_persona)
        app.logger.info(f"Parsed data: {parsed_data}")

        if not parsed_data:
            raise ValueError("Failed to parse generated persona")

        full_persona_data = {
            **data.to_dict(),
            **parsed_data,
            'generated_text': generated_persona,
            'timestamp': datetime.now().isoformat()
        }

        persona_id = str(uuid.uuid4())
        personas[persona_id] = full_persona_data

        app.logger.info(f"Persona stored with ID: {persona_id}")
        return jsonify({'persona': generated_persona, 'persona_id': persona_id})

    except Exception as e:
        app.logger.error(f"Error in generate_persona_stream: {str(e)}")
        return jsonify({'error': str(e)}), 500

def parse_generated_persona(generated_text):
    try:
        # Remove any text before the first '{' and after the last '}'
        json_start = generated_text.find('{')
        json_end = generated_text.rfind('}') + 1
        json_string = generated_text[json_start:json_end]
        
        # Parse the JSON string
        parsed_data = json.loads(json_string)
        
        # Ensure all required keys are present
        required_keys = ['name', 'summary', 'goals', 'nextSteps', 'lifeExperiences', 'qualificationsAndEducation', 'skills', 'strengths', 'valueProposition']
        for key in required_keys:
            if key not in parsed_data:
                parsed_data[key] = []
        
        return parsed_data
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return None

# def store_persona_in_chroma(persona_data):
#     persona_id = str(datetime.now().timestamp())
#     try:
#         persona_collection.add(
#             ids=[persona_id],
#             documents=[json.dumps(persona_data)],
#             metadatas=[{"type": "persona"}]
#         )
#         app.logger.info(f"Persona stored in ChromaDB with ID: {persona_id}")
#         return persona_id
#     except Exception as e:
#         app.logger.error(f"Error storing persona in ChromaDB: {str(e)}")
#         raise

@app.route('/get_persona/<persona_id>', methods=['GET'])
def get_persona(persona_id):
    try:
        persona_data = personas.get(persona_id)
        if persona_data:
            return jsonify(persona_data)
        else:
            return jsonify({'error': 'Persona not found'}), 404
    except Exception as e:
        app.logger.error(f"Error in get_persona: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/update_persona/<persona_id>', methods=['PUT'])
def update_persona(persona_id):
    try:
        data = request.json
        if persona_id in personas:
            personas[persona_id].update(data)
            return jsonify({'message': 'Persona updated successfully'})
        else:
            return jsonify({'error': 'Persona not found'}), 404
    except Exception as e:
        app.logger.error(f"Error in update_persona: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_all_personas', methods=['GET'])
def get_all_personas():
    try:
        return jsonify([{'id': id, **data} for id, data in personas.items()])
    except Exception as e:
        app.logger.error(f"Error in get_all_personas: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/')
def hello():
    return "Hello, World!"

# @app.teardown_appcontext
# def shutdown_session(exception=None):
#     db_session.remove()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') != 'production')
