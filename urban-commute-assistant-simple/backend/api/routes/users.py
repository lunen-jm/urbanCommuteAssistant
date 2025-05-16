from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional
import jwt as pyjwt  # Import PyJWT with a more descriptive alias
from pydantic import BaseModel
import sys
import os

# Add the project root to the Python path to enable absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings

router = APIRouter(prefix="/users", tags=["users"])

# Simplified user data store
users_db = {
    "testuser": {
        "username": "testuser",
        "email": "test@example.com",
        "hashed_password": "testpassword123",  # In a real app, this would be hashed
        "disabled": False,
    }
}

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    username: str
    email: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

# Authentication settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/token")

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    # In a real app, you would verify the hashed password here
    if password != user.hashed_password:
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = pyjwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except pyjwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = get_user(users_db, username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
