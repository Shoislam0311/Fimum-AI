import requests
import json
from typing import List, Dict, Any, Optional
from config import settings
from utils.query_classifier import classify_query
from utils.response_combiner import combine_coding_responses, combine_thinking_responses

# Model configuration based on query type
MODEL_CONFIG = {
    "normal": {
        "model": "openai/gpt-oss-20b:free",
        "temperature": 0.7
    },
    "reasoning": {
        "model": "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
        "temperature": 0.3
    },
    "coding": {
        "models": [
            {"model": "qwen/qwen3-coder:free", "weight": 0.3},
            {"model": "agentica-org/deepcoder-14b-preview:free", "weight": 0.3},
            {"model": "qwen/qwen-2.5-coder-32b-instruct:free", "weight": 0.4}
        ],
        "temperature": 0.2
    },
    "uncensored": {
        "model": "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        "temperature": 0.9
    },
    "thinking": {
        "models": [
            {"model": "moonshotai/kimi-vl-a3b-thinking:free", "weight": 0.5},
            {"model": "deepseek/deepseek-chat-v3-0324:free", "weight": 0.5}
        ],
        "temperature": 0.4
    },
    "image": {
        "models": [
            {"model": "mistralai/mistral-small-3.2-24b-instruct:free", "weight": 0.3},
            {"model": "moonshotai/kimi-vl-a3b-thinking:free", "weight": 0.3},
            {"model": "meta-llama/llama-3.2-11b-vision-instruct:free", "weight": 0.4}
        ],
        "temperature": 0.3
    }
}

def get_openrouter_headers():
    """Generate proper headers for OpenRouter API calls"""
    return {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.OPENROUTER_REFERER,
        "X-Title": settings.OPENROUTER_TITLE
    }

def call_openrouter_api(model: str, messages: List[Dict[str, Any]], 
                        temperature: float = 0.7, max_tokens: int = 2000) -> Dict[str, Any]:
    """Make a single API call to OpenRouter"""
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    try:
        response = requests.post(
            url,
            headers=get_openrouter_headers(),
            data=json.dumps(payload),
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"OpenRouter API call failed: {str(e)}")

def call_multi_model_api(models_config: List[Dict], messages: List[Dict[str, Any]], 
                         temperature: float = 0.7) -> List[Dict[str, Any]]:
    """Call multiple models and return all responses"""
    responses = []
    
    for model_info in models_config:
        try:
            response = call_openrouter_api(
                model_info["model"],
                messages,
                temperature=temperature
            )
            responses.append({
                "model": model_info["model"],
                "response": response,
                "weight": model_info.get("weight", 1.0/len(models_config))
            })
        except Exception as e:
            print(f"Error calling model {model_info['model']}: {str(e)}")
    
    return responses

def process_query(user_query: str, chat_history: List[Dict[str, str]], 
                  user_preferences: Dict[str, Any] = None, image_url: Optional[str] = None) -> Dict[str, Any]:
    """
    Process user query by:
    1. Classifying query type
    2. Adding context from user preferences
    3. Potentially performing web search
    4. Routing to appropriate model(s)
    5. Combining responses if needed
    """
    # Classify the query type
    query_type = classify_query(user_query, chat_history)
    
    # Build context-aware messages
    messages = build_context_aware_messages(
        user_query, 
        chat_history, 
        user_preferences,
        image_url
    )
    
    # Handle different query types
    if query_type in ["coding", "thinking", "image"] and query_type in MODEL_CONFIG:
        # Multi-model approach
        model_config = MODEL_CONFIG[query_type]
        responses = call_multi_model_api(
            model_config["models"],
            messages,
            temperature=model_config["temperature"]
        )
        return combine_responses(responses, query_type)
    
    elif query_type in MODEL_CONFIG:
        # Single model approach
        model_config = MODEL_CONFIG[query_type]
        response = call_openrouter_api(
            model_config["model"],
            messages,
            temperature=model_config["temperature"]
        )
        return {
            "type": query_type,
            "model_used": model_config["model"],
            "response": response["choices"][0]["message"]["content"],
            "raw_response": response
        }
    
    else:
        # Default to normal model
        model_config = MODEL_CONFIG["normal"]
        response = call_openrouter_api(
            model_config["model"],
            messages,
            temperature=model_config["temperature"]
        )
        return {
            "type": "normal",
            "model_used": model_config["model"],
            "response": response["choices"][0]["message"]["content"],
            "raw_response": response
        }

def build_context_aware_messages(user_query: str, chat_history: List[Dict[str, str]], 
                               user_preferences: Dict[str, Any], image_url: Optional[str] = None) -> List[Dict[str, Any]]:
    """Build messages with proper context and formatting"""
    messages = []
    
    # Add system message with user preferences
    system_content = "You are Fimum, a powerful personal AI assistant created by STN-AI. "
    
    if user_preferences:
        if user_preferences.get("tone"):
            system_content += f"Respond in a {user_preferences['tone']} tone. "
        if user_preferences.get("language_preference"):
            system_content += f"Primary language: {user_preferences['language_preference']}. "
        if user_preferences.get("goals"):
            system_content += f"User's goals: {user_preferences['goals']}. "
    
    system_content += "Be professional, helpful, and engaging. Respond concisely but thoroughly. Add appropriate emojis to make responses more friendly."
    
    messages.append({"role": "system", "content": system_content})
    
    # Add chat history
    for msg in chat_history:
        messages.append({"role": "user", "content": msg["query"]})
        messages.append({"role": "assistant", "content": msg["response"]})
    
    # Add current query (with image if present)
    if image_url:
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": user_query},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]
        })
    else:
        messages.append({"role": "user", "content": user_query})
    
    return messages

def combine_responses(responses: List[Dict[str, Any]], query_type: str) -> Dict[str, Any]:
    """Combine responses from multiple models using appropriate strategy"""
    if not responses:
        raise ValueError("No successful model responses to combine")
    
    # For coding queries, use a specialized combiner
    if query_type == "coding":
        combined = combine_coding_responses(responses)
        # Get final response from normal model
        final_response = call_openrouter_api(
            MODEL_CONFIG["normal"]["model"],
            [{"role": "user", "content": combined["combined_prompt"]}],
            temperature=0.3
        )
        return {
            "type": query_type,
            "models_used": combined["models_used"],
            "response": final_response["choices"][0]["message"]["content"],
            "raw_responses": combined["raw_responses"]
        }
    
    # For thinking/deep analysis, use another strategy
    elif query_type in ["thinking", "image"]:
        combined = combine_thinking_responses(responses)
        # Get final response from normal model
        final_response = call_openrouter_api(
            MODEL_CONFIG["normal"]["model"],
            [{"role": "user", "content": combined["combined_prompt"]}],
            temperature=0.3
        )
        return {
            "type": query_type,
            "models_used": combined["models_used"],
            "response": final_response["choices"][0]["message"]["content"],
            "raw_responses": combined["raw_responses"]
        }
    
    # Default combination strategy (simple weighted average of relevance)
    else:
        total_weight = sum(r["weight"] for r in responses)
        weighted_responses = [
            (r["response"]["choices"][0]["message"]["content"], r["weight"]/total_weight)
            for r in responses if "choices" in r["response"] and r["response"]["choices"]
        ]
        
        # Create a meta-prompt to combine the responses
        combined_prompt = """
        You are an expert AI editor. Below are multiple AI responses to the same query. 
        Your task is to create a single, cohesive, professional response that:
        1. Preserves the most accurate and helpful information
        2. Removes contradictions
        3. Maintains a professional, user-friendly tone
        4. Is concise yet comprehensive
        
        Responses to combine:
        """
        
        for i, (resp, weight) in enumerate(weighted_responses, 1):
            combined_prompt += f"\nResponse {i} (weight: {weight:.2f}):\n{resp}\n"
        
        combined_prompt += "\nCreate a single, improved response based on these inputs:"
        
        # Call the normal model to combine the responses
        model_config = MODEL_CONFIG["normal"]
        final_response = call_openrouter_api(
            model_config["model"],
            [{"role": "user", "content": combined_prompt}],
            temperature=0.3
        )
        
        return {
            "type": query_type,
            "models_used": [r["model"] for r in responses],
            "response": final_response["choices"][0]["message"]["content"],
            "raw_responses": [r["response"] for r in responses]
        }