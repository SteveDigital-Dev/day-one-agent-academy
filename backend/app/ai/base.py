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

    @classmethod
    def lesson_quiz(cls, content: str, grade_level: str, count: int = 5) -> list[dict]:
        # Prefill the assistant turn with "[" so the model is forced to continue the JSON array.
        # /no_think disables qwen3's extended thinking mode so content field is non-empty.
        return [
            {"role": "system", "content": "/no_think"},
            {
                "role": "user",
                "content": (
                    f"Generate {count} multiple-choice quiz questions for grade {grade_level} "
                    f"based on this lesson. Return a JSON array; each item: "
                    f'[{{"type":"quiz","prompt":"...","options":["A","B","C","D"],"correct":0}}].\n\n'
                    f"Lesson:\n{content[:1500]}"
                ),
            },
            # Prefill forces the model to continue from "[" rather than reasoning first
            {"role": "assistant", "content": "["},
        ]
