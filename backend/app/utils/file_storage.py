import os
import uuid
from pathlib import Path
from app.config.settings import settings

def ensure_upload_dir() -> Path:
    """
    Ensures that the uploads target directory exists on disk.
    """
    upload_path = Path(settings.UPLOAD_DIRECTORY)
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path

def save_file_to_disk(content: bytes, original_filename: str) -> str:
    """
    Saves file bytes to disk using a unique UUID-generated filename to prevent collisions.
    Returns the stored relative file path.
    """
    upload_dir = ensure_upload_dir()
    ext = os.path.splitext(original_filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    destination_path = upload_dir / unique_filename

    # Double check to prevent overwriting existing files
    while destination_path.exists():
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        destination_path = upload_dir / unique_filename

    with open(destination_path, "wb") as f:
        f.write(content)

    return str(destination_path)
