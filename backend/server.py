from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt as pyjwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'qasati-secret-dev-key-change-in-prod')
JWT_ALGO = 'HS256'
MOCK_OTP = '123456'

app = FastAPI(title=\"Qasati API\")
api_router = APIRouter(prefix=\"/api\")

# ---------- Static Data ----------
PACKAGES = [
    {\"id\": \"basic\", \"name\": \"الباقة الأساسية\", \"monthly_amount\": 25000, \"color\": \"#10B981\",
     \"features\": [\"ادخار شهري 25,000 د.ع\", \"تقارير شهرية\", \"إشعارات الدفع\"]},
    {\"id\": \"premium\", \"name\": \"الباقة المميزة\", \"monthly_amount\": 50000, \"color\": \"#047857\",
     \"features\": [\"ادخار شهري 50,000 د.ع\", \"تقارير شهرية وسنوية\", \"أولوية الدعم\", \"هدايا سنوية\"]},
    {\"id\": \"gold\", \"name\": \"الباقة الذهبية\", \"monthly_amount\": 100000, \"color\": \"#F59E0B\",
     \"features\": [\"ادخار شهري 100,000 د.ع\", \"تقارير مفصلة\", \"مستشار مالي مخصص\", \"هدايا فصلية\", \"عوائد إضافية\"]},
]

GOALS = [
    {\"id\": \"university\", \"name\": \"التعليم الجامعي\", \"icon\": \"school\", \"default_target\": 15000000, \"color\": \"#047857\"},
    {\"id\": \"marriage\", \"name\": \"الزواج\", \"icon\": \"heart\", \"default_target\": 25000000, \"color\": \"#EF4444\"},
    {\"id\": \"business\", \"name\": \"مشروع تجاري\", \"icon\": \"briefcase\", \"default_target\": 20000000, \"color\": \"#F59E0B\"},
    {\"id\": \"car\", \"name\": \"سيارة\", \"icon\": \"car-sport\", \"default_target\": 18000000, \"color\": \"#3B82F6\"},
    {\"id\": \"house\", \"name\": \"بيت\", \"icon\": \"home\", \"default_target\": 50000000, \"color\": \"#8B5CF6\"},
    {\"id\": \"custom\", \"name\": \"هدف مخصص\", \"icon\": \"star\", \"default_target\": 10000000, \"color\": \"#57534E\"},
]

# ---------- Models ----------
class SendOtpReq(BaseModel):
    phone: str

class VerifyOtpReq(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None

class UpdateProfileReq(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None

class ChildCreateReq(BaseModel):
    name: str
    dob: str  # YYYY-MM-DD
    gender: str  # boy / girl
    avatar_color: Optional[str] = \"#047857\"

class SubscriptionCreateReq(BaseModel):
    child_id: str
    goal_id: str
    goal_target: float
    goal_name: Optional[str] = None
    package_id: str

class PaymentReq(BaseModel):
    subscription_id: str
    payment_method: str  # zaincash, qicard, visa, mastercard

# ---------- Helpers ----------
def now_iso():
    return datetime.now(timezone.utc).isoformat()

def make_token(user_id: str) -> str:
    payload = {
        \"sub\": user_id,
        \"exp\": datetime.now(timezone.utc) + timedelta(days=30),
        \"iat\": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith(\"Bearer \"):
        raise HTTPException(status_code=401, detail=\"غير مصرح\")
    token = authorization.split(\" \", 1)[1]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except Exception:
        raise HTTPException(status_code=401, detail=\"رمز غير صالح\")
    user_id = payload.get(\"sub\")
    user = await db.users.find_one({\"id\": user_id}, {\"_id\": 0})
    if not user:
        raise HTTPException(status_code=401, detail=\"المستخدم غير موجود\")
    return user

# ---------- Auth Routes ----------
@api_router.post(\"/auth/send-otp\")
async def send_otp(req: SendOtpReq):
    # Mock: always succeeds, OTP is 123456
    return {\"success\": True, \"message\": \"تم إرسال الرمز\", \"mock_otp\": MOCK_OTP}

@api_router.post(\"/auth/verify-otp\")
async def verify_otp(req: VerifyOtpReq):
    if req.otp != MOCK_OTP:
        raise HTTPException(status_code=400, detail=\"رمز التحقق غير صحيح\")
    existing = await db.users.find_one({\"phone\": req.phone}, {\"_id\": 0})
    if existing:
        user = existing
        is_new = False
    else:
        user = {
            \"id\": str(uuid.uuid4()),
            \"phone\": req.phone,
            \"name\": req.name or \"ولي الأمر\",
            \"email\": \"\",
            \"city\": \"\",
            \"kyc_status\": \"pending\",  # pending / verified / rejected
            \"created_at\": now_iso(),
        }
        await db.users.insert_one(user.copy())
        is_new = True
    token = make_token(user[\"id\"])
    user.pop(\"_id\", None)
    return {\"token\": token, \"user\": user, \"is_new\": is_new}

@api_router.get(\"/auth/me\")
async def me(user=Depends(get_current_user)):
    return user

@api_router.put(\"/auth/profile\")
async def update_profile(req: UpdateProfileReq, user=Depends(get_current_user)):
    updates = {k: v for k, v in req.dict().items() if v is not None}
    if updates:
        await db.users.update_one({\"id\": user[\"id\"]}, {\"$set\": updates})
    updated = await db.users.find_one({\"id\": user[\"id\"]}, {\"_id\": 0})
    return updated

@api_router.post(\"/auth/verify-kyc\")
async def verify_kyc(user=Depends(get_current_user)):
    # Mock KYC verification
    await db.users.update_one({\"id\": user[\"id\"]}, {\"$set\": {\"kyc_status\": \"verified\"}})
    return {\"success\": True, \"kyc_status\": \"verified\"}

# ---------- Static Endpoints ----------
@api_router.get(\"/packages\")
async def list_packages():
    return PACKAGES

@api_router.get(\"/goals\")
async def list_goals():
    return GOALS

# ---------- Children ----------
@api_router.get(\"/children\")
async def list_children(user=Depends(get_current_user)):
    children = await db.children.find({\"user_id\": user[\"id\"]}, {\"_id\": 0}).to_list(100)
    return children

@api_router.post(\"/children\")
async def create_child(req: ChildCreateReq, user=Depends(get_current_user)):
    child = {
        \"id\": str(uuid.uuid4()),
        \"user_id\": user[\"id\"],
        \"name\": req.name,
        \"dob\": req.dob,
        \"gender\": req.gender,
        \"avatar_color\": req.avatar_color or \"#047857\",
        \"created_at\": now_iso(),
    }
    await db.children.insert_one(child.copy())
    child.pop(\"_id\", None)
    return child

@api_router.delete(\"/children/{child_id}\")
async def delete_child(child_id: str, user=Depends(get_current_user)):
    await db.children.delete_one({\"id\": child_id, \"user_id\": user[\"id\"]})
    await db.subscriptions.delete_many({\"child_id\": child_id, \"user_id\": user[\"id\"]})
    return {\"success\": True}

# ---------- Subscriptions ----------
@api_router.get(\"/subscriptions\")
async def list_subscriptions(user=Depends(get_current_user)):
    subs = await db.subscriptions.find({\"user_id\": user[\"id\"]}, {\"_id\": 0}).to_list(200)
    return subs

@api_router.post(\"/subscriptions\")
async def create_subscription(req: SubscriptionCreateReq, user=Depends(get_current_user)):
    child = await db.children.find_one({\"id\": req.child_id, \"user_id\": user[\"id\"]}, {\"_id\": 0})
    if not child:
        raise HTTPException(status_code=404, detail=\"الطفل غير موجود\")
    pkg = next((p for p in PACKAGES if p[\"id\"] == req.package_id), None)
    if not pkg:
        raise HTTPException(status_code=400, detail=\"باقة غير صالحة\")
    goal = next((g for g in GOALS if g[\"id\"] == req.goal_id), None)
    goal_name = req.goal_name or (goal[\"name\"] if goal else \"هدف\")
    sub = {
        \"id\": str(uuid.uuid4()),
        \"user_id\": user[\"id\"],
        \"child_id\": req.child_id,
        \"child_name\": child[\"name\"],
        \"child_avatar_color\": child.get(\"avatar_color\", \"#047857\"),
        \"goal_id\": req.goal_id,
        \"goal_name\": goal_name,
        \"goal_icon\": goal[\"icon\"] if goal else \"star\",
        \"goal_color\": goal[\"color\"] if goal else \"#047857\",
        \"goal_target\": req.goal_target,
        \"package_id\": req.package_id,
        \"package_name\": pkg[\"name\"],
        \"monthly_amount\": pkg[\"monthly_amount\"],
        \"current_amount\": 0.0,
        \"status\": \"pending_payment\",  # pending_payment / active / paused
        \"created_at\": now_iso(),
        \"next_payment_date\": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
    }
    await db.subscriptions.insert_one(sub.copy())
    sub.pop(\"_id\", None)
    return sub

# ---------- Payments ----------
@api_router.post(\"/payments/pay\")
async def pay(req: PaymentReq, user=Depends(get_current_user)):
    sub = await db.subscriptions.find_one({\"id\": req.subscription_id, \"user_id\": user[\"id\"]}, {\"_id\": 0})
    if not sub:
        raise HTTPException(status_code=404, detail=\"الاشتراك غير موجود\")
    amount = sub[\"monthly_amount\"]
    txn = {
        \"id\": str(uuid.uuid4()),
        \"user_id\": user[\"id\"],
        \"subscription_id\": sub[\"id\"],
        \"child_id\": sub[\"child_id\"],
        \"child_name\": sub[\"child_name\"],
        \"goal_name\": sub[\"goal_name\"],
        \"amount\": amount,
        \"type\": \"deposit\",
        \"status\": \"success\",
        \"payment_method\": req.payment_method,
        \"reference\": f\"QST{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:6].upper()}\",
        \"date\": now_iso(),
    }
    await db.transactions.insert_one(txn.copy())
    new_amount = sub[\"current_amount\"] + amount
    next_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    await db.subscriptions.update_one(
        {\"id\": sub[\"id\"]},
        {\"$set\": {\"current_amount\": new_amount, \"status\": \"active\", \"next_payment_date\": next_date}}
    )
    # notification
    notif = {
        \"id\": str(uuid.uuid4()),
        \"user_id\": user[\"id\"],
        \"title\": \"تمت عملية الدفع بنجاح\",
        \"body\": f\"تم إيداع {int(amount):,} د.ع لهدف {sub['goal_name']} - {sub['child_name']}\",
        \"icon\": \"checkmark-circle\",
        \"color\": \"#10B981\",
        \"read\": False,
        \"date\": now_iso(),
    }
    await db.notifications.insert_one(notif.copy())
    txn.pop(\"_id\", None)
    return txn

# ---------- Transactions ----------
@api_router.get(\"/transactions\")
async def list_transactions(user=Depends(get_current_user)):
    txns = await db.transactions.find({\"user_id\": user[\"id\"]}, {\"_id\": 0}).sort(\"date\", -1).to_list(200)
    return txns

# ---------- Notifications ----------
@api_router.get(\"/notifications\")
async def list_notifications(user=Depends(get_current_user)):
    notifs = await db.notifications.find({\"user_id\": user[\"id\"]}, {\"_id\": 0}).sort(\"date\", -1).to_list(100)
    return notifs

@api_router.post(\"/notifications/mark-read\")
async def mark_all_read(user=Depends(get_current_user)):
    await db.notifications.update_many({\"user_id\": user[\"id\"]}, {\"$set\": {\"read\": True}})
    return {\"success\": True}

# ---------- Dashboard ----------
@api_router.get(\"/dashboard\")
async def dashboard(user=Depends(get_current_user)):
    children = await db.children.find({\"user_id\": user[\"id\"]}, {\"_id\": 0}).to_list(100)
    subs = await db.subscriptions.find({\"user_id\": user[\"id\"]}, {\"_id\": 0}).to_list(200)
    txns = await db.transactions.find({\"user_id\": user[\"id\"]}, {\"_id\": 0}).sort(\"date\", -1).to_list(10)
    total_saved = sum(s.get(\"current_amount\", 0) for s in subs)
    total_target = sum(s.get(\"goal_target\", 0) for s in subs)
    monthly_commitment = sum(s.get(\"monthly_amount\", 0) for s in subs if s.get(\"status\") == \"active\")
    unread_count = await db.notifications.count_documents({\"user_id\": user[\"id\"], \"read\": False})
    return {
        \"total_saved\": total_saved,
        \"total_target\": total_target,
        \"monthly_commitment\": monthly_commitment,
        \"children_count\": len(children),
        \"active_subscriptions\": len([s for s in subs if s.get(\"status\") == \"active\"]),
        \"children\": children,
        \"subscriptions\": subs,
        \"recent_transactions\": txns,
        \"unread_notifications\": unread_count,
    }

# ---------- Health ----------
@api_router.get(\"/\")
async def root():
    return {\"app\": \"Qasati\", \"status\": \"ok\"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[\"*\"],
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()
