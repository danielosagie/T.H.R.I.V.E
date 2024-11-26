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
from werkzeug.datastructures import MultiDict
import traceback

load_dotenv('.env.local')

logging.basicConfig(level=logging.DEBUG)

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
CORS(app, resources={
    r"/*": {
        "origins": ["https://tcard.vercel.app", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ['https://tcard.vercel.app', 'http://localhost:3000']:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['db_session'] = db_session

# In-memory storage for personas
personas = {}

def extract_json(text):
    # Find the first occurrence of '{' and the last occurrence of '}'
    start = text.find('{')
    end = text.rfind('}')
    
    if start != -1 and end != -1:
        # Extract the JSON-like string
        json_str = text[start:end+1]
        
        # Remove any leading/trailing whitespace
        json_str = json_str.strip()
        
        # Attempt to parse the JSON
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            # If parsing fails, attempt to fix common issues
            # Replace single quotes with double quotes
            json_str = json_str.replace("'", '"')
            
            # Ensure all keys are properly quoted
            json_str = re.sub(r'(\w+)(?=\s*:)', r'"\1"', json_str)
            
            # Try parsing again
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                return None
    return None

@app.route('/generate_persona_stream', methods=['POST', 'OPTIONS'])
def generate_persona_stream():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'success'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response

    try:
        data = request.form.to_dict(flat=False)
        # Convert the dictionary to a MultiDict
        multi_data = MultiDict(data)

        input_text = "\n".join([
            f"{key}: {', '.join(multi_data.getlist(key)) if '[]' in key else multi_data.get(key)}"
            for key in multi_data.keys() if key != 'generation_settings'
        ])

        app.logger.info("Received request for generate_persona_stream")
        app.logger.info(f"Received data: {data}")
        
        app.logger.info(f"Constructed input text: {input_text}")
        
        generation_settings = json.loads(data.get('generation_settings', '{}'))
        
        api_key = generation_settings.get('api_key') or os.environ.get("GROQ_API_KEY")
        model = generation_settings.get('model', 'llama3-8b-8192')
        creativity = float(generation_settings.get('creativity', 0.5))
        realism = float(generation_settings.get('realism', 0.5))
        custom_prompt = generation_settings.get('default_prompt', '')
        
        system_prompt = """You are an Employment Readiness Professional Counselor, Mental Therapist, and Behavioral Analyst. Your task is to create a comprehensive profile card for job seekers, extracting and inferring as much valuable information as possible from their experiences and goals. Generate an extensive list of tags for each section, being concise yet insightful. Dig deep like a behavioral therapist would, uncovering hidden strengths, skills, and potential. Use the following format, aiming for at least 10-15 tags per section:

- Name: [Full Name]
- Summary: [A creative and insightful 2-3 sentence summary highlighting unique qualities and potential. Avoid using "profile" or their name.]

</PersonalInfo>
<QualificationsAndEducation>
- [Relevant qualification/certification], [Key aspect]
- [Educational background], [Notable achievement/skill gained]
- [Additional training/course], [Practical application]
...
</QualificationsAndEducation>
<Skills>
- [Technical skill], [Proficiency level], [Practical application]
- [Soft skill], [Context where developed], [Potential use in target field]
- [Transferable skill], [Origin], [Relevance to career goals]
...
</Skills>
<Goals>
- [Career goal], [Motivation behind it], [Potential impact]
- [Personal development goal], [Relevance to career], [Action plan]
- [Learning objective], [Expected outcome], [Timeline]
...
</Goals>
<Strengths>
- [Core strength], [Evidence from experiences], [Potential application]
- [Character trait], [How it manifests], [Value in target career]
- [Unique strength], [Origin story], [Competitive advantage]
...
</Strengths>
<LifeExperiences>
- [Significant experience], [Skills developed], [Lessons learned]
- [Challenge faced], [How overcome], [Personal growth]
- [Unique life event], [Impact on worldview], [Relevance to career goals]
...
</LifeExperiences>
<ValueProposition>
- [Key value], [Supporting evidence], [Benefit to employer]
- [Unique selling point], [What sets them apart], [Industry relevance]
- [Personal mission], [Alignment with career goals], [Potential impact]
...
</ValueProposition>
<NextSteps>
- [Immediate action item], [Expected outcome], [Timeline]
- [Medium-term goal], [Steps to achieve], [Potential obstacles]
- [Long-term aspiration], [Milestones], [Resources needed]
...
</NextSteps>

Be extremely thorough and creative in extracting and inferring information. Each tag should be concise yet packed with meaning. Draw connections between experiences, skills, and career goals. Highlight unique combinations of skills or experiences that could set the candidate apart."""

        input_prompt = f"""
Create a professional profile card for a job seeker using the following information. Be creative and insightful in extracting relevant skills, traits, and potential connections from their current experiences to their new career goals:
{input_text}
IMPORTANT: Your entire response must be a single, valid JSON object. Do not include any text outside of the JSON structure. Use the following structure, ensuring all keys and values are properly quoted:
{{
  "name": "Full Name",
  "summary": "A creative and insightful 2-3 sentence summary",
  "qualificationsAndEducation": [
    "Relevant qualification/certification, Key aspect",
    "Educational background, Notable achievement/skill gained",
    "Additional training/course, Practical application"
  ],
  "skills": [
    "Technical skill, Proficiency level, Practical application",
    "Soft skill, Context where developed, Potential use in target field",
    "Transferable skill, Origin, Relevance to career goals"
  ],
  "goals": [
    "Career goal, Motivation behind it, Potential impact",
    "Personal development goal, Relevance to career, Action plan",
    "Learning objective, Expected outcome, Timeline"
  ],
  "strengths": [
    "Core strength, Evidence from experiences, Potential application",
    "Character trait, How it manifests, Value in target career",
    "Unique strength, Origin story, Competitive advantage"
  ],
  "lifeExperiences": [
    "Significant experience, Skills developed, Lessons learned",
    "Challenge faced, How overcome, Personal growth",
    "Unique life event, Impact on worldview, Relevance to career goals"
  ],
  "valueProposition": [
    "Key value, Supporting evidence, Benefit to employer",
    "Unique selling point, What sets them apart, Industry relevance",
    "Personal mission, Alignment with career goals, Potential impact"
  ],
  "nextSteps": [
    "Immediate action item, Expected outcome, Timeline",
    "Medium-term goal, Steps to achieve, Potential obstacles",
    "Long-term aspiration, Milestones, Resources needed"
  ]
}}
Ensure all relevant information is included and formatted appropriately. If a section lacks direct information, creatively infer potential points based on the overall profile. Focus on highlighting the most transferable and relevant qualities for the person's career goals. You may include more than three items per section if needed.
"""

        app.logger.info(f"Constructed input prompt: {input_prompt}")

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

        parsed_data = extract_json(generated_persona)
        
        if parsed_data is None:
            logging.error(f"Failed to parse generated persona. Raw response: {generated_persona}")
            return jsonify({"error": "Failed to parse generated persona", "raw_response": generated_persona}), 500

        return jsonify({"persona": parsed_data})

    except Exception as e:
        logging.error(f"Error in generate_persona_stream: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

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

@app.route('/generate_star_bullets', methods=['POST', 'OPTIONS'])
def generate_star_bullets():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'success'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response

    try:
        data = request.json
        
        # Extract STAR content and basic info
        star_content = data.get('starContent', {})
        basic_info = data.get('basicInfo', {})

        system_prompt = """You are an expert-level employment readiness specialist, behavioral therapist, and HR professional. Your task is to review, evaluate, and enhance provided resume content to make it impactful and effective. When given resume input, transform it into optimized, high-quality bullet points that highlight clarity, context, action, and results without introducing unrelated or invented information. Each bullet should maintain relevance, use powerful action verbs, and include measurable outcomes where applicable. Your output should reflect professional resume bullet formatting, emphasizing succinct and impactful wording. 

Ensure that:
- Basic or underdeveloped content is improved with context, specificity, and quantifiable outcomes.
- Already refined input is further enhanced for clarity and maximum impact.
- All responses should remain concise, powerful, and relevant to the job role.

Example Enhancement:
Input: "Assisted customers with purchases and inquiries."
Enhanced Bullet: "- Provided tailored customer assistance, addressing inquiries promptly and facilitating a seamless purchasing process, contributing to a 15% boost in customer satisfaction."

Your response should maintain this format and approach.
 """

        input_prompt = f"""
Review and enhance the provided resume content, transforming it into a strong, concise, but very impactful resume bullets. If the content is basic, improve it with context, measurable results, and clarity. If it is already improved, refine it for conciseness and impact. Keep the response formatted as resume-style bullet points, no sub-bullets but still impactful and telling of the full story. Here is the data you are making changes to:

Company: {basic_info.get('company')}
Position: {basic_info.get('position')}
Industry: {basic_info.get('industry')}

Situation: {star_content.get('situation')}
Task: {star_content.get('task')}
Action: {star_content.get('actions')}
Result: {star_content.get('results')}

Format the response as a JSON object with an array of bullet points:
{{
    "bullets": [
        "Bullet point 1",
        "Bullet point 2",
        "Bullet point 3"
    ]
}}"""

        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        
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
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=2000,
            top_p=0.8,
            stream=True
        )

        generated_response = ''
        for chunk in chat_completion:
            if chunk.choices[0].delta.content is not None:
                generated_response += chunk.choices[0].delta.content

        parsed_data = extract_json(generated_response)
        
        if parsed_data is None:
            logging.error(f"Failed to parse generated bullets. Raw response: {generated_response}")
            return jsonify({"error": "Failed to parse generated bullets", "raw_response": generated_response}), 500

        return jsonify({"bullets": parsed_data.get("bullets", [])})

    except Exception as e:
        logging.error(f"Error in generate_star_bullets: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/star/recommendations', methods=['POST', 'OPTIONS'])
def generate_star_recommendations():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'})

    try:
        data = request.json
        
        system_prompt = """You are an expert-level employment readiness specialist, behavioral therapist, and HR professional. Your task is to review, evaluate, and enhance provided resume content to make it impactful and effective. When given resume input, transform it into optimized, high-quality bullet points that highlight clarity, context, action, and results without introducing unrelated or invented information. Each bullet should maintain relevance, use powerful action verbs, and include measurable outcomes where applicable. Your output should reflect professional resume bullet formatting, emphasizing succinct and impactful wording. 

Ensure that:
- Basic or underdeveloped content is improved with context, specificity, and quantifiable outcomes.
- Already refined input is further enhanced for clarity and maximum impact.
- All responses should remain concise, powerful, and relevant to the job role.

Example Enhancement:
Input: "Assisted customers with purchases and inquiries."
Enhanced Bullet: "- Provided tailored customer assistance, addressing inquiries promptly and facilitating a seamless purchasing process, contributing to a 15% boost in customer satisfaction."

Your response should maintain this format and approach.
"""

        input_prompt = f"""
Given the user's STAR-based experience input, reformat it according to the STAR structure and provide detailed, high-value feedback as JSON arrays. For each STAR section, generate between 6-9 impactful recommendations that build upon one another, prioritizing suggestions that add measurable value.

For each recommendation, provide the following:

Format the response as:
{{
    "situation": [
        {{
            "title": "Clear recommendation title",
            "subtitle": "Brief explanation of the improvement",
            "original_content": "Original text",
            "examples": [
                {{
                    "content": "Improved version 1",
                    "explanation": "Why this is better"
                }},
                {{
                    "content": "Improved version 2",
                    "explanation": "Why this is even better"
                }}
            ]
        }}
    ],
    "task": [
        {{
            "title": "Clear recommendation title",
            "subtitle": "Brief explanation of the improvement",
            "original_content": "Original text",
            "examples": [
                {{
                    "content": "Improved version 1",
                    "explanation": "Why this is better"
                }},
                {{
                    "content": "Improved version 2",
                    "explanation": "Why this is even better"
                }}
            ]
        }}
    ],
    "action": [
        {{
            "title": "Clear recommendation title",
            "subtitle": "Brief explanation of the improvement",
            "original_content": "Original text",
            "examples": [
                {{
                    "content": "Improved version 1",
                    "explanation": "Why this is better"
                }},
                {{
                    "content": "Improved version 2",
                    "explanation": "Why this is even better"
                }}
            ]
        }}
    ],
    "result": [
        {{
            "title": "Clear recommendation title",
            "subtitle": "Brief explanation of the improvement",
            "original_content": "Original text",
            "examples": [
                {{
                    "content": "Improved version 1",
                    "explanation": "Why this is better"
                }},
                {{
                    "content": "Improved version 2",
                    "explanation": "Why this is even better"
                }}
            ]
        }}
    ]
}}

Prioritize recommendations that focus on efficiency, clarity, and impact. If a section is already well-developed, note that further improvements aren’t necessary. Only include a recommendation if it contributes significant value:

Company: {data.get('company')}
Position: {data.get('position')}
Industry: {data.get('industry')}

Situation: {data.get('situation')}
Task: {data.get('task')}
Action: {data.get('actions')}
Result: {data.get('results')}

"""

        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": input_prompt}
            ],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=1000,
            top_p=0.8,
            stream=True
        )

        generated_response = ''
        for chunk in chat_completion:
            if chunk.choices[0].delta.content is not None:
                generated_response += chunk.choices[0].delta.content

        parsed_data = extract_json(generated_response)
        
        if parsed_data is None:
            logging.error(f"Failed to parse recommendations. Raw response: {generated_response}")
            return jsonify({"error": "Failed to parse recommendations"}), 500

        return jsonify({"recommendations": parsed_data})

    except Exception as e:
        logging.error(f"Error generating recommendations: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# @app.teardown_appcontext
# def shutdown_session(exception=None):
#     db_session.remove()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
