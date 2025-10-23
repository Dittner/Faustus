from pydantic import BaseModel


class TextFileRenameSchema(BaseModel):
    from_src: str
    to_src: str


class TextFileSchema(BaseModel):
    text: str
    alias: str
