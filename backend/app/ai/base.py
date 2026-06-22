"""Model-agnostic AI provider interface."""

from abc import ABC, abstractmethod


class AIProvider(ABC):
    @abstractmethod
    async def chat(self, messages: list[dict], **kwargs) -> str:
        ...

    @abstractmethod
    async def generate(self, prompt: str, **kwargs) -> str:
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        ...


class TutorPromptBuilder:
    SYSTEM = """You are a helpful AI tutor for Agent Academy. You help students understand concepts by:
- Explaining topics clearly at their grade level
- Asking Socratic questions to deepen understanding
- Providing hints when a student is stuck
- Adapting your tone to the student's personality and frustration level
- Never giving away answers directly without guiding the student there first"""

    @classmethod
    def tutor(cls, question: str, grade_level: str, context: str | None = None) -> list[dict]:
        messages = [
            {"role": "system", "content": cls.SYSTEM},
            {"role": "user", "content": f"Grade level: {grade_level}"},
        ]
        if context:
            messages.append({"role": "user", "content": f"Context: {context}"})
        messages.append({"role": "user", "content": question})
        return messages

    @classmethod
    def quiz(cls, subject: str, topic: str, grade_level: str, count: int = 5) -> list[dict]:
        return [
            {"role": "system", "content": f"Generate {count} quiz questions for {subject} - {topic} at {grade_level} grade level. Return as JSON array with 'question', 'options' (array of 4), and 'correct_index' fields."},
            {"role": "user", "content": f"Create {count} questions about {topic} for grade {grade_level}."},
        ]

    @classmethod
    def explain(cls, concept: str, grade_level: str) -> list[dict]:
        return [
            {"role": "system", "content": f"Explain '{concept}' to a {grade_level} grade student. Use analogies, examples, and simple language."},
            {"role": "user", "content": f"Explain {concept}"},
        ]
