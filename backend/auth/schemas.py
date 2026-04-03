from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    # EmailStr valida automáticamente que tenga un '@' y un dominio válido
    correo: EmailStr 
    contrasena: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    id_usuario: int
    nombre: str
    es_admin: bool