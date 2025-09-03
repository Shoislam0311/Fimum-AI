from search_engines import Google, Bing, DuckDuckGo
from typing import List, Dict, Any

def perform_web_search(query: str, num_results: int = 5) -> List[Dict[str, str]]:
    """
    Perform a web search using multiple search engines and consolidate results
    """
    # Initialize search engines
    engines = [
        Google(),
        Bing(),
        DuckDuckGo()
    ]
    
    all_results = []
    
    # Perform search on each engine
    for engine in engines:
        try:
            results = engine.search(query)
            for i, result in enumerate(results.results()):
                if i >= num_results:
                    break
                all_results.append({
                    "title": result.title,
                    "url": result.url,
                    "snippet": result.snippet,
                    "engine": engine.__class__.__name__.lower()
                })
        except Exception as e:
            print(f"Error with {engine.__class__.__name__}: {str(e)}")
    
    # Deduplicate results (keep first occurrence of each URL)
    seen_urls = set()
    unique_results = []
    for result in all_results:
        if result["url"] not in seen_urls:
            seen_urls.add(result["url"])
            unique_results.append(result)
    
    return unique_results[:num_results]

def format_search_results_for_prompt(results: List[Dict[str, str]]) -> str:
    """
    Format search results for inclusion in an AI prompt
    """
    if not results:
        return "No relevant web information found."
    
    formatted = "Here is relevant information from the web that might help answer the query:\n\n"
    
    for i, result in enumerate(results, 1):
        formatted += f"[{i}] {result['title']}\n"
        formatted += f"Source: {result['url']}\n"
        formatted += f"Summary: {result['snippet']}\n\n"
    
    formatted += "Please use this information to provide an accurate, up-to-date response. "
    formatted += "Cite sources when directly referencing specific information."
    
    return formatted