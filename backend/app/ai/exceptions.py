class AIServiceError(Exception):
    """Base exception for all AI service errors."""
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class AIRateLimitError(AIServiceError):
    """Raised when the AI provider rate limit is exceeded."""
    def __init__(self, message: str = "AI rate limit exceeded. Please try again later."):
        super().__init__(message, status_code=429)

class AITimeoutError(AIServiceError):
    """Raised when the AI provider request times out."""
    def __init__(self, message: str = "AI request timed out."):
        super().__init__(message, status_code=504)

class AIResponseError(AIServiceError):
    """Raised when the AI provider returns a malformed or empty response."""
    def __init__(self, message: str = "Failed to parse AI provider response."):
        super().__init__(message, status_code=502)
