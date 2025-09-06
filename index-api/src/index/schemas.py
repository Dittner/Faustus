from pydantic import BaseModel


class TextFileSchema(BaseModel):
    id: str
    text: str
