from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

class BaseAIService(ABC):
    """
    Abstract Base Class for AI Provider Client Services.
    Enforces a consistent interface for plain generation and structured JSON generation.
    """

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Generates a plain text response for a given prompt.
        """
        pass

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        response_schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Generates a structured JSON response enforcing a target schema.
        """
        pass
