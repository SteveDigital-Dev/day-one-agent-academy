import httpx

from app.ai.base import AIProvider
from app.config import settings


class AnthropicProvider(AIProvider):
    def __init__(self):
        self.api_key = settings.anthropic_api_key
        self.base_url = "https://api.anthropic.com/v1"
        self.model = "claude-3-haiku-20240307"

    @property
    def name(self) -> str:
        return "anthropic"

    async def chat(self, messages: list[dict], **kwargs) -> str:
        system = None
        if messages and messages[0].get("role") == "system":
            system = messages.pop(0)["content"]

        body = {
            "model": kwargs.get("model", self.model),
            "messages": messages,
            "max_tokens": kwargs.get("max_tokens", 1024),
        }
        if system:
            body["system"] = system

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                },
                json=body,
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["content"][0]["text"]

    async def generate(self, prompt: str, **kwargs) -> str:
        return await self.chat([{"role": "user", "content": prompt}], **kwargs)
