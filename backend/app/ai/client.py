import json
import logging
from typing import Any, Dict, Optional
from groq import AsyncGroq, APIConnectionError, APIError, APITimeoutError, RateLimitError

from app.ai.base import BaseAIService
from app.ai.exceptions import AIRateLimitError, AIResponseError, AIServiceError, AITimeoutError
from app.config.settings import settings

logger = logging.getLogger(__name__)

class GroqClient(BaseAIService):
    """
    Reusable Groq LLM Client implementing BaseAIService interface.
    Interfaces with Groq's API using gemma2-9b-it.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        default_temperature: Optional[float] = None,
        default_max_tokens: Optional[int] = None,
    ):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model_name = model_name or settings.MODEL_NAME
        self.default_temperature = default_temperature if default_temperature is not None else settings.TEMPERATURE
        self.default_max_tokens = default_max_tokens or settings.MAX_TOKENS

        if not self.api_key or self.api_key == "your-groq-api-key-here":
            logger.warning("Groq API key is not configured or using default placeholder.")

        self._client = AsyncGroq(api_key=self.api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Generates a plain text response from Groq LLM.
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = await self._client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=temperature if temperature is not None else self.default_temperature,
                max_tokens=max_tokens or self.default_max_tokens,
            )

            if not response.choices or not response.choices[0].message.content:
                raise AIResponseError("Groq returned an empty text response choice.")

            return response.choices[0].message.content.strip()

        except RateLimitError as e:
            logger.error(f"Groq Rate Limit Exceeded: {str(e)}")
            raise AIRateLimitError(f"Groq API rate limit exceeded: {str(e)}")
        except (APITimeoutError, APIConnectionError) as e:
            logger.error(f"Groq Connection/Timeout Error: {str(e)}")
            raise AITimeoutError(f"Groq API connection timed out: {str(e)}")
        except APIError as e:
            logger.error(f"Groq API Error: {str(e)}")
            raise AIServiceError(f"Groq API failure: {str(e)}", status_code=502)
        except Exception as e:
            logger.error(f"Unexpected error during Groq generation: {str(e)}")
            raise AIServiceError(f"Unexpected AI service error: {str(e)}")

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Generates a structured JSON output from Groq LLM enforcing response_format json_object.
        """
        system_instruction = (
            "You are a strict JSON generator. Return ONLY valid JSON adhering to the target schema. "
            "Do not wrap in markdown block code markers like ```json."
        )
        if system_prompt:
            system_instruction = f"{system_prompt}\n\n{system_instruction}"

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": f"{prompt}\n\nTarget JSON Schema format reference:\n{json.dumps(response_schema, indent=2)}"},
        ]

        try:
            response = await self._client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=temperature if temperature is not None else self.default_temperature,
                max_tokens=max_tokens or self.default_max_tokens,
                response_format={"type": "json_object"},
            )

            if not response.choices or not response.choices[0].message.content:
                raise AIResponseError("Groq returned an empty response for structured generation.")

            raw_text = response.choices[0].message.content.strip()
            return json.loads(raw_text)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Groq response as valid JSON: {str(e)}")
            raise AIResponseError(f"Groq response is not valid JSON: {str(e)}")
        except RateLimitError as e:
            logger.error(f"Groq Rate Limit Exceeded: {str(e)}")
            raise AIRateLimitError(f"Groq API rate limit exceeded: {str(e)}")
        except (APITimeoutError, APIConnectionError) as e:
            logger.error(f"Groq Connection/Timeout Error: {str(e)}")
            raise AITimeoutError(f"Groq API connection timed out: {str(e)}")
        except APIError as e:
            logger.error(f"Groq API Error: {str(e)}")
            raise AIServiceError(f"Groq API failure: {str(e)}", status_code=502)
        except Exception as e:
            logger.error(f"Unexpected error during Groq structured generation: {str(e)}")
            raise AIServiceError(f"Unexpected AI service error: {str(e)}")

# Default global Groq client instance
groq_client = GroqClient()
