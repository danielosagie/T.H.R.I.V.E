import re
import json
import logging

def parse_bullets_response(response_text: str) -> dict:
    """Parse the LLM response and extract bullets."""
    logging.info(f"Attempting to parse response: {response_text}")
    
    try:
        # First try to parse as direct JSON
        try:
            json_data = json.loads(response_text)
            if isinstance(json_data, dict) and "bullets" in json_data:
                return json_data
        except json.JSONDecodeError:
            pass

        # Look for JSON-like structure in the text
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            try:
                json_data = json.loads(json_match.group(0))
                if isinstance(json_data, dict) and "bullets" in json_data:
                    return json_data
            except json.JSONDecodeError:
                pass

        # If no JSON found, look for bullet points
        bullets = []
        lines = response_text.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('- ') or line.startswith('• '):
                bullets.append(line)
            elif line.startswith('"- ') or line.startswith('"• '):
                bullets.append(line.strip('"'))

        if bullets:
            return {"bullets": bullets}

        # If no bullets found, create bullets from paragraphs
        paragraphs = [p.strip() for p in response_text.split('\n\n') if p.strip()]
        if paragraphs:
            bullets = [f"- {p}" for p in paragraphs if not p.startswith('- ')]
            return {"bullets": bullets}

        raise ValueError("No valid bullet points found in response")

    except Exception as e:
        logging.error(f"Error parsing bullets: {str(e)}")
        raise ValueError(f"Failed to parse bullets: {str(e)}") 