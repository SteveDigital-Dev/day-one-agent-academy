import json
import re

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


async def generate_lesson_quiz(
    content: str,
    grade_level: str,
    count: int = 5,
) -> list[dict]:
    provider = _get_provider()
    messages = TutorPromptBuilder.lesson_quiz(content, grade_level, count)
    # think=False prevents qwen3 from spending its token budget on hidden reasoning.
    # The assistant prefill "[" in messages means raw starts mid-array; prepend it.
    raw = await provider.chat(messages, temperature=0.1, max_tokens=1500, think=False)
    raw = "[" + raw

    # Strip <think>…</think> blocks as a safety net
    raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()

    # Extract the first complete JSON array (model may continue talking after the "]")
    array_text = _extract_first_json_array(raw)
    questions = json.loads(array_text)
    if not isinstance(questions, list):
        raise ValueError("AI did not return a JSON array")
    return questions[:count]


def _extract_first_json_array(text: str) -> str:
    """Return the substring spanning the first complete [...] JSON array."""
    start = text.find("[")
    if start == -1:
        raise ValueError("No JSON array found in response")
    depth = 0
    in_string = False
    escape = False
    for i, ch in enumerate(text[start:], start):
        if escape:
            escape = False
            continue
        if ch == "\\" and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
    raise ValueError("Unterminated JSON array in response")
