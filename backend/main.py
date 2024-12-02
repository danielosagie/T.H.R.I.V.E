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

# Configure CORS at application level
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:3000", "https://tcard.vercel.app"],
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "expose_headers": ["Content-Type", "Authorization"],
         "supports_credentials": True,
         "max_age": 600  # Cache preflight requests for 10 minutes
     }})

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:3000', 'https://tcard.vercel.app']:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Type, Authorization'
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


@app.route('/api/star/recommendations', methods=['POST', 'OPTIONS'])
def generate_star_recommendations():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'})

    try:
        data = request.json
        
        system_prompt = """You are an employment readiness provider specialist, behavioral therapist, and expert-level HR professional. Your task is to analyze provided content structured in the STAR (Situation, Task, Action, Result) format and create efficient, impactful, cumulative feedback for each section. This feedback should be presented in JSON format with 6-9 carefully prioritized recommendations per section, only if they truly add significant value. If the input is already high quality, the LLM should refrain from unnecessary suggestions and indicate that no major changes are needed.

Key Guidelines:

Prioritize High-Impact Feedback: Focus on the most effective, high-value suggestions that will greatly enhance the STAR response.
Cumulative Improvement: Each recommendation must build on the previous one, creating a progressive series of enhancements.
Avoid Generic Feedback: Do not use templated examples from the prompt unless they are relevant to the content provided.
Content-Relevant Feedback: Ensure all examples and suggestions directly relate to the provided user input. If an example from the prompt applies, use it; otherwise, create specific, relevant examples.
Limit to Valuable Suggestions: Only provide recommendations that significantly improve the content. If no further impactful improvements can be made, indicate that feedback is complete for that section.
Output Structure: For each section (Situation, Task, Action, Result), create a JSON array with each recommendation containing:

Title: A concise title summarizing the recommendation.
Subtitle: An explanation of why this recommendation enhances the content.
Original Content: The provided content for that STAR section.
Examples: Two cumulative examples showing how the recommendation improves the content, with the core changes highlighted in bold. Only focus on the work experiences 
Format Example:

{
  "situation": [
    {
      "title": "Principle: Specificity",
      "subtitle": "Provide detailed context to highlight why the situation is significant and who it affects. This ensures the reader understands the stakes involved and the environment in which the action took place.",
      "original_content": "Ruffian Corp was struggling to reach their goals of 20 million per store",
      "examples": [
        {
          "example_1": "Ruffian Corp was struggling to hit their target of $20 million per store, **increasing pressure on store managers to cut costs** (added resulting effect).",
          "example_2": "Ruffian Corp struggled to meet the $20 million per store target due to **inefficiencies and rising costs, straining store managers to find solutions** (included reasons and resulting impact)."
        }
      ]
    },
    {
      "title": "Principle: Stakeholder Details",
      "subtitle": "Include relevant stakeholders to show the complexity of the situation and accountability. This adds depth and clarifies who is involved or impacted by the challenge.",
      "original_content": "Ruffian Corp was struggling to reach their goals of 20 million per store",
      "examples": [
        {
          "example_1": "Ruffian Corp's $20 million per store goal challenged **store and regional managers to reassess budgets** (added key stakeholders).",
          "example_2": "Ruffian Corp’s goal put **store managers, finance teams, and supply chain staff** under pressure to collaborate on cost-saving measures (included more stakeholders for depth)."
        }
      ]
    }
  ],
  "task": [
    {
      "title": "Principle: Clarify Responsibility",
      "subtitle": "Clearly define what your role entailed and how it was connected to the overall goal. This makes your contribution and accountability clear.",
      "original_content": "I was responsible for overseeing the project.",
      "examples": [
        {
          "example_1": "I was responsible for **leading a cross-functional team to meet project milestones** (clarified role and action).",
          "example_2": "I was responsible for **coordinating a team of 10 to align with strategic goals** (added team detail and alignment)."
        }
      ]
    },
    {
      "title": "Principle: Impact Linkage",
      "subtitle": "Connect your task to broader organizational or project objectives to demonstrate the importance of your work in the larger context.",
      "original_content": "I was responsible for overseeing the project.",
      "examples": [
        {
          "example_1": "I led a team to ensure milestones were met, **aligning with annual growth targets** (linked task to organizational goals).",
          "example_2": "I oversaw the project to contribute to a **15% efficiency boost** (added specific target linkage)."
        }
      ]
    }
  ],
  "action": [
    {
      "title": "Principle: Specific Steps",
      "subtitle": "Detail specific actions to show your active involvement and the effort you put into achieving results.",
      "original_content": "I led the project team and made sure everything ran smoothly.",
      "examples": [
        {
          "example_1": "I **scheduled weekly meetings and addressed roadblocks** to maintain progress (added specific actions).",
          "example_2": "I **created detailed plans and assigned tasks** to adhere to timelines (included task assignment)."
        }
      ]
    },
    {
      "title": "Principle: Demonstrate Leadership",
      "subtitle": "Showcase leadership by emphasizing how you took the initiative or guided the team effectively.",
      "original_content": "I led the project team and made sure everything ran smoothly.",
      "examples": [
        {
          "example_1": "I **initiated an agile workflow**, boosting productivity by 20% (highlighted leadership and impact).",
          "example_2": "I **coordinated cross-department efforts** to resolve issues quickly (showcased proactive leadership)."
        }
      ]
    }
  ],
  "result": [
    {
      "title": "Principle: Quantify Success",
      "subtitle": "Use specific numbers to illustrate the impact of your efforts. This adds credibility and demonstrates measurable achievement.",
      "original_content": "The project was successful and met expectations.",
      "examples": [
        {
          "example_1": "The project led to a **15% reduction in production time and 10% cost savings** (added specific metrics).",
          "example_2": "The project improved **customer satisfaction by 25% and reduced delays by 20%** (added additional impact metrics)."
        }
      ]
    },
    {
      "title": "Principle: Long-Term Impact",
      "subtitle": "Demonstrate how your work had lasting effects or benefits to show that the impact was sustainable.",
      "original_content": "The project was successful and met expectations.",
      "examples": [
        {
          "example_1": "The project set a standard, **increasing company-wide efficiency by 10% over six months** (mentioned long-term benefit).",
          "example_2": "The framework enabled future projects to achieve **faster timelines** (emphasized replicable success)."
        }
      ]
    }
  ]
}

"""

        input_prompt = f"""Given the following user-provided STAR experience, format it into the STAR structure and provide detailed, high-value feedback as JSON arrays. Each section should include between 6-9 impactful recommendations that build cumulatively from one to the next. Only include suggestions if they provide significant value. If a section is already well-developed, note that further changes aren't necessary.

Each recommendation should include:

Title (brief, summarizing the main idea)
Subtitle (explaining why it adds value)
Original Content (the user’s initial input)
Examples showing cumulative improvements with key changes highlighted.
Focus on efficiency and impact. If a recommendation won't significantly improve the content, do not include it.

Input Data:

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
            max_tokens=4000,
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

@app.route('/api/star/bullets', methods=['POST', 'OPTIONS'])
def generate_bullets():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.json
        logging.info(f"Received data: {data}")
        
        # Extract STAR content and basic info
        basic_info = data.get('basic_info', {})
        star_content = data.get('star_content', {})
        
        # Fix industry field handling
        industry = basic_info.get('industry', [])
        industry_str = ', '.join(industry) if isinstance(industry, list) else str(industry)

        system_prompt = """You are an expert-level employment readiness specialist, behavioral therapist, and HR professional. Your task is to review, evaluate, and enhance provided resume content to make it impactful and effective. When given resume input, transform it into optimized, high-quality bullet points that highlight clarity, context, action, and results without introducing unrelated or invented information. Each bullet should maintain relevance, use powerful action verbs, and include measurable outcomes where applicable. Your output should reflect professional resume bullet formatting, emphasizing succinct and impactful wording. 

Ensure that:
- Basic or underdeveloped content is improved with context, specificity, and quantifiable outcomes.
- Already refined input is further enhanced for clarity and maximum impact.
- All responses should remain concise, powerful, and relevant to the job role.

Example Enhancement:
Input: "- Assisted customers with purchases and inquiries."
Enhanced Bullet: "- Provided tailored customer assistance, addressing inquiries promptly and facilitating a seamless purchasing process, contributing to a 15% boost in customer satisfaction."

Your response should maintain this format and approach.
 """

        input_prompt = f"""Review and enhance the provided resume content, transforming it into a efficient, strong, concise, but very impactful resume bullets. If the content is basic, improve it with context, measurable results, and clarity. If it is already improved, refine it for conciseness and impact. Do not over-improve it. Focus on efficiency and impact but CLEAR STORYTELLING. Keep the response formatted as resume-style bullet points, no sub-bullets but still impactful and telling of the full story. Here is the data you are making changes to. Try not to change the original type of content too much like saying Spearheaded when they didnt say they lead anything unless there was undertones in there that they did:

Company: {basic_info.get('company', '')}
Position: {basic_info.get('position', '')}
Industry: {industry_str}

Situation: {star_content.get('situation', '')}
Task: {star_content.get('task', '')}
Action: {star_content.get('actions', '')}  
Result: {star_content.get('results', '')}  

Format the response as a JSON object with an array of 3-4 bullet points:
{{{{
    "bullets": [
        "- Bullet point 1",
        "- Bullet point 2",
        "- Bullet point 3",
        "- Bullet point 4"
    ]
}}}}"""

        # Add logging to debug prompt
        logging.info(f"Formatted prompt with data: {input_prompt}")

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

        logging.info(f"Generated response: {generated_response}")
        
        try:
            parsed_data = parse_bullets_response(generated_response)
            return jsonify(parsed_data)
        except ValueError as e:
            logging.error(f"Parsing error: {str(e)}")
            return jsonify({
                "error": "Failed to parse generated bullets",
                "raw_response": generated_response
            }), 500

    except Exception as e:
        logging.error(f"Error in generate_bullets: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
      
@app.route('/api/star/tailor', methods=['POST', 'OPTIONS'])
def tailor_bullets():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.json
        logging.info(f"Received data: {data}")
        
        # Extract all necessary data
        basic_info = data.get('basic_info', {})
        current_bullets = data.get('currentBullets', [])
        target_position = data.get('targetPosition', {})
        
        # Handle industry data
        industry = basic_info.get('industry', [])
        industry_str = ', '.join(industry) if isinstance(industry, list) else str(industry)

        system_prompt = """You are an expert ATS optimization specialist and professional resume writer. Your task is to tailor existing resume bullets for a specific job position while:
Please keep the bullets related to the original job, but also incorporate elements that would appeal to the position we desire. Avoid making it too obvious that we are tailoring the content for that job by not explicitly stating the specific position we are applying for or removing every detail from the original role. The adjustments should be subtle, with a moderate level of tailoring for that role.
1. Maintaining the core achievements and experiences
2. Incorporating relevant keywords from the job description
3. Aligning the language with the target role and company
4. Ensuring bullets pass ATS screening
5. Following any specific tailoring instructions provided

Guidelines:
- Keep bullets concise but impactful (max 1 lines each & 4 bullets total unless instructed otherwise)
- Include measurable results where present
- Use industry-specific terminology from the target role
- Maintain professional resume formatting
Please remember the following text. 

Add any words that I am missing without changing the original content. The changes should not exceed 3% and should not include any statements about company values or any additional information in the bullet points. Just make your changes.
- Focus on transferable skills when changing industries
- Prioritize keywords from the job description without keyword stuffing. If I provide special instructions, follow them and put them in the brackets do not say anything extra after just acheive the task in front of you."""

        input_prompt = f"""Tailor these resume bullets for the following target position. Review and enhance the provided resume content, transforming it into a efficient, strong, concise, but very impactful resume bullets. If the content is basic, improve it with context, measurable results, and clarity. If it is already improved, refine it for conciseness and impact. Do not over-improve it. Focus on efficiency and impact but CLEAR STORYTELLING. Keep the response formatted as resume-style bullet points, no sub-bullets but still impactful and telling of the full story.:

TARGET POSITION DETAILS:
Title: {target_position.get('title', '')}
Company: {target_position.get('company', '')}
Industry: {target_position.get('industry', '')}
Job Description: {target_position.get('description', '')}

SPECIAL INSTRUCTIONS:
{target_position.get('instructions', 'No special instructions provided')}

CURRENT POSITION:
Company: {basic_info.get('company', '')}
Position: {basic_info.get('position', '')}
Industry: {industry_str}

CURRENT BULLETS:
{current_bullets}

Please remember the following text. 

Add any words that I am missing without changing the original content. The changes should not exceed 3% and should not include any statements about company values or any additional information in the bullet points. Just make your changes.

Please tailor these bullets to:
1. Include key terms from the job description
2. Highlight transferable skills
3. Maintain the core achievements. Please keep the bullets related to the original job, but also incorporate elements that would appeal to the position we desire. Avoid making it too obvious that we are tailoring the content for that job by not explicitly stating the specific position we are applying for or removing every detail from the original role. The adjustments should be subtle, with a moderate level of tailoring.

Format the response as a JSON object with an array of bullets without any extra text or notes. ONLY 4 BULLETS UNLESS INSTRUCTED OTHERWISE:
{{{{
    "bullets": [
        "- Tailored bullet 1",
        "- Tailored bullet 2",
        "- Tailored bullet 3",
        "- Tailored bullet 4"
    ]
}}}}"""

        logging.info(f"Tailoring prompt: {input_prompt}")

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
            temperature=0.5,  # Lower temperature for more focused output
            max_tokens=2000,
            top_p=0.7,
            stream=True
        )

        generated_response = ''
        for chunk in chat_completion:
            if chunk.choices[0].delta.content is not None:
                generated_response += chunk.choices[0].delta.content

        logging.info(f"Generated tailored bullets: {generated_response}")
        
        try:
            parsed_data = parse_bullets_response(generated_response)
            return jsonify(parsed_data)
        except ValueError as e:
            logging.error(f"Parsing error: {str(e)}")
            return jsonify({
                "error": "Failed to parse tailored bullets",
                "raw_response": generated_response
            }), 500

    except Exception as e:
        logging.error(f"Error in tailor_bullets: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/ping', methods=['GET', 'OPTIONS'])
def ping():
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify({
        "status": "ok",
        "message": "Server is running"
    }), 200

# @app.teardown_appcontext
# def shutdown_session(exception=None):
#     db_session.remove()

def parse_bullets_response(response_text: str) -> dict:
    """Parse the LLM response for bullet points."""
    try:
        # Clean up the response text
        cleaned_text = response_text.strip()
        
        # Try to extract JSON using regex first
        json_match = re.search(r'\{[\s\S]*?\}(?=\s*$)', cleaned_text)
        if json_match:
            try:
                json_data = json.loads(json_match.group(0))
                if isinstance(json_data, dict) and "bullets" in json_data:
                    bullets = []
                    for bullet in json_data["bullets"]:
                        clean_bullet = bullet.strip().replace('\\"', '"').replace('"', '')
                        if not clean_bullet.startswith('-'):
                            clean_bullet = f"- {clean_bullet}"
                        bullets.append(clean_bullet)
                    return {"bullets": bullets}
            except json.JSONDecodeError:
                pass
        
        # If JSON parsing fails, try to extract bullet points directly
        bullet_points = re.findall(r'[-•]\s*([^\n]+)', cleaned_text)
        if bullet_points:
            return {"bullets": [f"- {b.strip()}" for b in bullet_points]}
            
        raise ValueError("No valid bullet points found in response")
        
    except Exception as e:
        logging.error(f"Error parsing bullets: {str(e)}")
        raise ValueError(f"Failed to parse bullets: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
