from pydantic import BaseModel, ConfigDict

class BaseSchema(BaseModel):
    """
    Base Pydantic model enforcing ORM mode (from_attributes) and standard serialization rules.
    """
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )
