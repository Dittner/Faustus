from pydantic import BaseModel, EmailStr, Field, ConfigDict
from fastapi import APIRouter, HTTPException

router = APIRouter()

languages = []


class Language(BaseModel):
    id: int
    name: str


@router.get("/languages", tags=["Languages"])
def get_languages():
    #raise HTTPException(status_code=404, detail='Book not found')
    return languages


@router.post("/languages", tags=["Languages"])
def create_language(lang: Language):
    languages.append(lang)
    return {"success": True, 'lang': lang}


class UserSchema(BaseModel):
    email: EmailStr
    bio: str | None = Field(max_length=1000)
    age: int = Field(ge=0, le=130)
    model_config = ConfigDict(extra='forbid')


user = UserSchema(email="aba@mail.com", bio=None, age=12)

users = []
@router.post("/user")
def add_user(user: UserSchema):
    users.append(user)
    return {"success": True}
