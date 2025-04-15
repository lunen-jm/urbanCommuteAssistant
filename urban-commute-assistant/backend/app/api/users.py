from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    location: str

# In-memory user storage for demonstration purposes
fake_users_db = {
    1: UserProfile(id=1, name="John Doe", email="john@example.com", location="New York"),
    2: UserProfile(id=2, name="Jane Smith", email="jane@example.com", location="San Francisco"),
}

@router.get("/users/", response_model=List[UserProfile])
async def get_users():
    return list(fake_users_db.values())

@router.get("/users/{user_id}", response_model=UserProfile)
async def get_user(user_id: int):
    user = fake_users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=UserProfile)
async def update_user(user_id: int, user: UserProfile):
    if user_id not in fake_users_db:
        raise HTTPException(status_code=404, detail="User not found")
    fake_users_db[user_id] = user
    return user