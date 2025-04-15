from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class Notification(BaseModel):
    id: int
    user_id: int
    message: str
    is_active: bool

class NotificationCreate(BaseModel):
    user_id: int
    message: str

# In-memory storage for notifications (for demonstration purposes)
notifications_db = []

@router.get("/notifications/", response_model=List[Notification])
async def get_notifications(user_id: int):
    user_notifications = [notif for notif in notifications_db if notif.user_id == user_id]
    return user_notifications

@router.post("/notifications/", response_model=Notification)
async def create_notification(notification: NotificationCreate):
    new_id = len(notifications_db) + 1
    new_notification = Notification(id=new_id, user_id=notification.user_id, message=notification.message, is_active=True)
    notifications_db.append(new_notification)
    return new_notification

@router.delete("/notifications/{notification_id}", response_model=Notification)
async def delete_notification(notification_id: int):
    global notifications_db
    for notif in notifications_db:
        if notif.id == notification_id:
            notifications_db = [n for n in notifications_db if n.id != notification_id]
            return notif
    raise HTTPException(status_code=404, detail="Notification not found")