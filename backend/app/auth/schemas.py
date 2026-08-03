import uuid
from typing import Literal

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    # Self-registration can only ever create a parent account. "student" and
    # "admin" accounts are provisioned separately (student profiles are
    # created by their parent via POST /users/students; admin accounts are
    # not self-serve) - letting a client pass an arbitrary role string here
    # let anyone register as role="admin" and bypass every ownership check
    # in the app (admin branches skip the student.user_id == current_user.id
    # comparison by design).
    role: Literal["parent"] = "parent"


class AuthUser(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: str

    model_config = {"from_attributes": True}
