from openai import OpenAI as OpenRouterClient
from core.config import OPENROUTER_API_KEY

LLM_MODEL: str = "minimax/minimax-m3:free"

client: OpenRouterClient = OpenRouterClient(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)