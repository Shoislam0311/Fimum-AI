def classify_query(user_query: str, chat_history: list = None) -> str:
    """
    Classify the query type based on content and context
    
    Returns one of:
    - "normal": General conversation
    - "reasoning": Logical puzzles, deep thinking
    - "coding": Programming-related queries
    - "uncensored": Explicitly requests unfiltered response
    - "thinking": Requests deep analysis
    - "image": Contains or references an image
    """
    query = user_query.lower().strip()
    
    # Check for uncensored requests
    if any(keyword in query for keyword in ["uncensored", "raw response", "no filter", "unfiltered"]):
        return "uncensored"
    
    # Check for image-related queries
    if any(keyword in query for keyword in ["image", "picture", "photo", "visual", "analyze this"]):
        return "image"
    
    # Check for coding requests
    coding_keywords = ["code", "program", "function", "algorithm", "script", "debug", 
                      "python", "javascript", "html", "css", "java", "c++", "sql", "app"]
    if any(keyword in query for keyword in coding_keywords):
        return "coding"
    
    # Check for reasoning/thinking requests
    reasoning_keywords = ["think", "analyze", "reason", "why", "how", "explain", 
                         "thought process", "deep dive", "consider", "evaluate", "puzzle"]
    if any(keyword in query for keyword in reasoning_keywords):
        return "thinking"
    
    # Check conversation history for context
    if chat_history:
        recent_messages = chat_history[-3:] if len(chat_history) > 3 else chat_history
        for msg in recent_messages:
            if "code" in msg.get("query", "").lower() or "code" in msg.get("response", "").lower():
                return "coding"
            if "think" in msg.get("query", "").lower() or "analyze" in msg.get("query", "").lower():
                return "thinking"
    
    # Default to normal
    return "normal"