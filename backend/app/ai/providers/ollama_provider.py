import httpx

from app.ai.base import AIProvider
from app.config import settings


class OllamaProvider(AIProvider):
    def __init__(self):
        self.base_url = settings.ollama_base_url.rstrip("/")
        self.model = settings.ollama_model

    @property
    def name(self) -> str:
        return "ollama"

    async def chat(self, messages: list[dict], **kwargs) -> str:
        payload: dict = {
            "model": kwargs.get("model", self.model),
            "messages": messages,
            "options": {
                "temperature": kwargs.get("temperature", 0.7),
                "num_predict": kwargs.get("max_tokens", 1024),
            },
            "stream": False,
        }
        # qwen3: think=False prevents hidden reasoning from consuming the token budget
        if "think" in kwargs:
            payload["think"] = kwargs["think"]
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=180,
            )
            resp.raise_for_status()
            return resp.json()["message"]["content"]

    async def generate(self, prompt: str, **kwargs) -> str:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": kwargs.get("model", self.model),
                    "prompt": prompt,
                    "options": {
                        "temperature": kwargs.get("temperature", 0.7),
                        "num_predict": kwargs.get("max_tokens", 1024),
                    },
                    "stream": False,
                },
                timeout=120,
            )
            resp.raise_for_status()
            return resp.json()["response"]
