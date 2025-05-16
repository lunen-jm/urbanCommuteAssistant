from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class User(BaseModel):
    username: str
    email: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/users/")
async def create_user(user: User):
    return {"user": user}

print("Imports successful and app created!")
