from app.config import settings
from app.ai.base import AIProvider, TutorPromptBuilder
from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.anthropic_provider import AnthropicProvider
from app.ai.providers.ollama_provider import OllamaProvider


_providers: dict[str, AIProvider] = {}


def _get_provider() -> AIProvider:
    name = settings.ai_provider
    if name not in _providers:
        if name == "openai":
            _providers[name] = OpenAIProvider()
        elif name == "anthropic":
            _providers[name] = AnthropicProvider()
        else:
            _providers[name] = OllamaProvider()
    return _providers[name]


async def tutor_chat(
    question: str,
    grade_level: str,
    context: str | None = None,
    **kwargs,
) -> str:
    provider = _get_provider()
    messages = TutorPromptBuilder.tutor(question, grade_level, context)
    return await provider.chat(messages, **kwargs)


async def generate_quiz(
    subject: str,
    topic: str,
    grade_level: str,
    count: int = 5,
    **kwargs,
) -> str:
    provider = _get_provider()
    messages = TutorPromptBuilder.quiz(subject, topic, grade_level, count)
    return await provider.chat(messages, **kwargs)


async def explain_concept(
    concept: str,
    grade_level: str,
    **kwargs,
) -> str:
    provider = _get_provider()
    messages = TutorPromptBuilder.explain(concept, grade_level)
    return await provider.chat(messages, **kwargs)
