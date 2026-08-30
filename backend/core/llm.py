from openai import OpenAI as OpenRouterClient
from openai import RateLimitError
from core.config import OPENROUTER_API_KEYS

LLM_MODEL: str = "minimax/minimax-m3:free"

current_key_index = 0
client: OpenRouterClient = None


def build_client(api_key: str) -> None:
    """Rebuild the module-level client with the given API key."""
    global client
    client = OpenRouterClient(api_key=api_key, base_url="https://openrouter.ai/api/v1")


if not OPENROUTER_API_KEYS:
    raise RuntimeError(
        "No OpenRouter API keys found. Set at least OPENROUTER_API_KEY1 in .env."
    )

build_client(OPENROUTER_API_KEYS[current_key_index])


def create_completion(**kwargs):
    """
    Rotation-safe wrapper around client.chat.completions.create().
    On RateLimitError, rotates to the next key in OPENROUTER_API_KEYS and
    retries, cycling through all keys before giving up.
    Callers should use this instead of calling client.chat.completions.create()
    directly, since `client` gets reassigned on rotation and a directly-held
    reference to the old client object would go stale.
    """
    global current_key_index
    total_keys = len(OPENROUTER_API_KEYS)
    attempts = 0
    while attempts < total_keys:
        try:
            return client.chat.completions.create(**kwargs)
        except RateLimitError:
            current_key_index = (current_key_index + 1) % total_keys
            build_client(OPENROUTER_API_KEYS[current_key_index])
            attempts += 1
    raise Exception("All OpenRouter API keys exhausted. Try again later.")