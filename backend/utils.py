import re
import json
from supabase import create_client

def create_supabase_client(url, key):
    return create_client(url, key)

def classify_query_type(prompt, file_url, image_query):
    """
    Classify user query type for smart model routing.
    """
    prompt = prompt.lower()
    if file_url and (image_query or "image" in prompt or "analyze" in prompt):
        return "vision"
    if re.search(r"(code|program|python|js|javascript|write a function|fix code)", prompt):
        return "coding"
    if re.search(r"(think deeply|analyze|reason|logical|puzzle)", prompt):
        return "thinking"
    if re.search(r"(uncensored|no filter|raw|nsfw)", prompt):
        return "uncensored"
    if re.search(r"(logic|reason|why|how does|explain)", prompt):
        return "reasoning"
    if re.search(r"(search|find|lookup|research)", prompt):
        return "search"
    return "normal"

def get_user_prefs(supabase, user_id):
    res = supabase.table("user_prefs").select("*").eq("user_id", user_id).execute()
    if res.data:
        return res.data[0].get("prefs", {})
    return {}

def update_user_prefs(supabase, user_id, prefs):
    supabase.table("user_prefs").upsert({"user_id": user_id, "prefs": json.dumps(prefs)}).execute()

def inject_context_into_prompt(prompt, prefs):
    if not prefs:
        return prompt
    context = ""
    for k, v in prefs.items():
        context += f"{k}: {v}\n"
    return f"{context}\n{prompt}"

def store_chat_history(supabase, user_id, prompt, answer):
    supabase.table("chat_history").insert({"user_id": user_id, "prompt": prompt, "answer": answer}).execute()

def fetch_chat_history(supabase, user_id):
    res = supabase.table("chat_history").select("*").eq("user_id", user_id).order("id", desc=True).limit(30).execute()
    if res.data:
        return res.data
    return []