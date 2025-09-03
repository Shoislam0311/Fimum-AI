def combine_coding_responses(responses: list) -> dict:
    """Combine responses from multiple coding models"""
    if not responses:
        return {"error": "No responses to combine"}
    
    # Extract content from responses
    contents = []
    for response in responses:
        try:
            content = response["response"]["choices"][0]["message"]["content"]
            contents.append({
                "model": response["model"],
                "content": content,
                "weight": response["weight"]
            })
        except (KeyError, IndexError):
            continue
    
    if not contents:
        return {"error": "Failed to extract content from responses"}
    
    # Create a meta-prompt to combine the responses
    combined_prompt = """
    You are an expert coding assistant. Below are multiple AI responses to the same coding query. 
    Your task is to create a single, cohesive, professional response that:
    1. Preserves the most accurate and helpful code
    2. Removes contradictions
    3. Maintains a professional, user-friendly explanation
    4. Is concise yet comprehensive
    5. Includes the best practices from all responses
    
    Responses to combine:
    """
    
    for i, content in enumerate(contents, 1):
        combined_prompt += f"\nResponse {i} (Model: {content['model']}, Weight: {content['weight']:.2f}):\n{content['content']}\n"
    
    combined_prompt += "\nCreate a single, improved response based on these inputs:"
    
    return {
        "type": "coding",
        "models_used": [c["model"] for c in contents],
        "combined_prompt": combined_prompt,
        "raw_responses": contents
    }

def combine_thinking_responses(responses: list) -> dict:
    """Combine responses from thinking/analysis models"""
    if not responses:
        return {"error": "No responses to combine"}
    
    # Extract content from responses
    contents = []
    for response in responses:
        try:
            content = response["response"]["choices"][0]["message"]["content"]
            contents.append({
                "model": response["model"],
                "content": content,
                "weight": response["weight"]
            })
        except (KeyError, IndexError):
            continue
    
    if not contents:
        return {"error": "Failed to extract content from responses"}
    
    # Create a meta-prompt to combine the responses
    combined_prompt = """
    You are an expert analyst. Below are multiple AI responses to the same analytical query. 
    Your task is to create a single, cohesive, professional response that:
    1. Preserves the most insightful perspectives
    2. Removes contradictions
    3. Maintains a professional, user-friendly tone
    4. Is concise yet comprehensive
    5. Integrates the best insights from all responses
    
    Responses to combine:
    """
    
    for i, content in enumerate(contents, 1):
        combined_prompt += f"\nResponse {i} (Model: {content['model']}, Weight: {content['weight']:.2f}):\n{content['content']}\n"
    
    combined_prompt += "\nCreate a single, improved response based on these inputs:"
    
    return {
        "type": "thinking",
        "models_used": [c["model"] for c in contents],
        "combined_prompt": combined_prompt,
        "raw_responses": contents
    }