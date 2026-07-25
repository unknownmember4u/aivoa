import enum

class UserRole(str, enum.Enum):
    QA_ANALYST = "QA_ANALYST"
    QA_MANAGER = "QA_MANAGER"
    ADMIN = "ADMIN"

class ComplaintStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    CLOSED = "CLOSED"

class Severity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    MAJOR = "MAJOR"
    MINOR = "MINOR"

class Priority(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class RiskLevel(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class ComplaintSource(str, enum.Enum):
    EMAIL = "EMAIL"
    PHONE = "PHONE"
    WEB_PORTAL = "WEB_PORTAL"
    REGULATORY_NOTICE = "REGULATORY_NOTICE"
