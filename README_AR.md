# تطبيق قاصتي

تم استخراج الملفات من النص المرفوع وترتيبها كمشروع Expo Router + Backend FastAPI.

## ملاحظة مهمة
التطبيق يحتاج Backend منشور على رابط HTTPS لأن APK على الهاتف لا يستطيع الاتصال بـ localhost.
قبل بناء APK عدّل الرابط في:
`frontend/eas.json` داخل `EXPO_PUBLIC_BACKEND_URL`.

## تشغيل الواجهة محلياً
```bash
cd frontend
npm install
npx expo start --clear
```

## تشغيل الباكند محلياً
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

## بناء APK بواسطة EAS
```bash
cd frontend
npm install
npm install -g eas-cli
eas login
eas init
eas build -p android --profile preview
```

رمز OTP التجريبي: `123456`.
