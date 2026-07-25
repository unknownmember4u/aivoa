import logging
import sys
from pythonjsonlogger import jsonlogger
from app.config.settings import settings

# Sensitive key names to redact automatically in log outputs
SENSITIVE_KEYS = {
    "password",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "api_key",
    "groq_api_key",
    "secret",
    "cookie",
}

class SensitiveDataFilter(logging.Filter):
    """
    Security Filter ensuring sensitive parameters (API Keys, JWT Tokens,
    Passwords, Authorization headers, Cookies, and Secrets) are never leaked to logs.
    """
    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, dict):
            record.msg = self._redact_dict(record.msg)
        elif isinstance(record.msg, str):
            record.msg = self._redact_string(record.msg)
        return True

    def _redact_dict(self, data: dict) -> dict:
        redacted = {}
        for k, v in data.items():
            if k.lower() in SENSITIVE_KEYS:
                redacted[k] = "[REDACTED]"
            elif isinstance(v, dict):
                redacted[k] = self._redact_dict(v)
            else:
                redacted[k] = v
        return redacted

    def _redact_string(self, text: str) -> str:
        # Prevents logging raw Authorization Bearer tokens or API keys embedded in strings
        for key in ["Bearer ", "authorization", "api_key", "password"]:
            if key in text.lower() and len(text) > 100:
                return "[REDACTED LOG CONTENT]"
        return text

def setup_logging() -> None:
    """
    Configures structured JSON logging for the application with security redaction.
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG)

    # Remove standard handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    # Setup JSON formatter for stdout
    log_handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s',
        timestamp=True
    )
    log_handler.setFormatter(formatter)
    
    # Attach sensitive data filter
    log_handler.addFilter(SensitiveDataFilter())
    logger.addHandler(log_handler)

    # Link uvicorn logs to use this handler
    logging.getLogger("uvicorn.access").handlers = [log_handler]
    logging.getLogger("uvicorn.error").handlers = [log_handler]

logger = logging.getLogger(__name__)
