import os
import json
from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
from search_engines import Google
from supabase import create_client, Client
from reducers import combine_model_outputs
from utils import (
    classify_query_type,
    get_user_prefs,
    update_user_prefs,
    inject_context_into_prompt,
    create_supabase_client,
    store_chat_history,
    fetch_chat_history,
)
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SITE_URL = "https://fimum.ai"
SITE_TITLE = "Fimum AI"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    supabase = None
    print("Supabase connection failed:", e)

def get_headers():
    return {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_TITLE,
    }

@app.post("/api/chat")
async def chat(
    prompt: str = Form(...),
    user_id: str = Form(...),
    lang: str = Form("en"),
    file_url: str = Form(None),
    image_query: str = Form(None),
):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase connection failed.")
    try:
        prefs = get_user_prefs(supabase, user_id)
        context = inject_context_into_prompt(prompt, prefs)
        query_type = classify_query_type(prompt, file_url, image_query)
        model_outputs = []
        search_results = None

        if "search" in query_type or ("book" in prompt or "find" in prompt):
            g = Google()
            res = g.search(prompt, num_results=3)
            search_results = "\n".join([f"{r['title']}: {r['link']}" for r in res])

        if query_type == "normal":
            model = "openai/gpt-oss-20b:free"
            data = {"model": model, "messages": [{"role": "user", "content": context}]}
            resp = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers=get_headers(),
                data=json.dumps(data),
            )
            answer = resp.json()["choices"][0]["message"]["content"]
            model_outputs = [answer]

        elif query_type == "reasoning":
            model = "nvidia/llama-3.1-nemotron-ultra-253b-v1:free"
            data = {"model": model, "messages": [{"role": "user", "content": context}]}
            resp = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers=get_headers(),
                data=json.dumps(data),
            )
            answer = resp.json()["choices"][0]["message"]["content"]
            model_outputs = [answer]

        elif query_type == "coding":
            models = [
                "qwen/qwen3-coder:free",
                "agentica-org/deepcoder-14b-preview:free",
                "qwen/qwen-2.5-coder-32b-instruct:free",
            ]
            for model in models:
                data = {"model": model, "messages": [{"role": "user", "content": context}]}
                resp = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers=get_headers(),
                    data=json.dumps(data),
                )
                try:
                    answer = resp.json()["choices"][0]["message"]["content"]
                except Exception:
                    answer = resp.text
                model_outputs.append(answer)
            answer = combine_model_outputs(model_outputs, "code")

        elif query_type == "uncensored":
            model = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free"
            data = {"model": model, "messages": [{"role": "user", "content": context}]}
            resp = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers=get_headers(),
                data=json.dumps(data),
            )
            answer = resp.json()["choices"][0]["message"]["content"]
            model_outputs = [answer]

        elif query_type == "thinking":
            models = [
                "moonshotai/kimi-vl-a3b-thinking:free",
                "deepseek/deepseek-chat-v3-0324:free",
            ]
            for model in models:
                message = (
                    [{"type": "text", "text": context}] if "kimi" in model else context
                )
                data = {"model": model, "messages": [{"role": "user", "content": message}]}
                resp = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers=get_headers(),
                    data=json.dumps(data),
                )
                try:
                    answer = resp.json()["choices"][0]["message"]["content"]
                except Exception:
                    answer = resp.text
                model_outputs.append(answer)
            answer = combine_model_outputs(model_outputs, "thinking")

        elif query_type == "vision":
            models = [
                "mistralai/mistral-small-3.2-24b-instruct:free",
                "moonshotai/kimi-vl-a3b-thinking:free",
                "meta-llama/llama-3.2-11b-vision-instruct:free",
            ]
            for model in models:
                content = [
                    {"type": "text", "text": image_query or "Analyze this image:"},
                    {"type": "image_url", "image_url": {"url": file_url}},
                ]
                data = {"model": model, "messages": [{"role": "user", "content": content}]}
                resp = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers=get_headers(),
                    data=json.dumps(data),
                )
                try:
                    answer = resp.json()["choices"][0]["message"]["content"]
                except Exception:
                    answer = resp.text
                model_outputs.append(answer)
            answer = combine_model_outputs(model_outputs, "image")

        else:
            answer = "Sorry, I couldn't classify your query."

        if search_results:
            answer = f"Web Research:\n{search_results}\n\n{answer}"

        store_chat_history(supabase, user_id, prompt, answer)
        return JSONResponse(
            {
                "answer": answer,
                "model_outputs": model_outputs,
                "query_type": query_type,
                "ai_models": [
                    {
                        "name": model.split(":")[0],
                        "owner": "STN",
                        "parameters": "34B"
                    }
                    for model in (
                        models if query_type in ["coding", "vision", "thinking"] else [model]
                    )
                ]
            }
        )
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.post("/api/upload")
async def upload_file(user_id: str = Form(...), file: UploadFile = File(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase connection failed.")
    try:
        from supabase.storage.client import StorageClient
        storage = StorageClient(SUPABASE_URL, SUPABASE_KEY)
        bucket = "uploads"
        try:
            storage.create_bucket(bucket, public=True)
        except Exception:
            pass  # already exists
        file_bytes = await file.read()
        filename = f"{user_id}/{file.filename}"
        storage.from_(bucket).upload(filename, file_bytes)
        public_url = storage.from_(bucket).get_public_url(filename)
        return {"file_url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def chat_history(user_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase connection failed.")
    try:
        history = fetch_chat_history(supabase, user_id)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/prefs")
async def set_prefs(user_id: str = Form(...), prefs: str = Form(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase connection failed.")
    try:
        update_user_prefs(supabase, user_id, json.loads(prefs))
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {"status": "Fimum backend running."}
