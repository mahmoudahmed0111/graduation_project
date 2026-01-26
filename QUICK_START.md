# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create `.env` in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_PUBLIC_UNIVERSITY_SLUG=beni-suef
```

### 3. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000

## 🧪 Test Credentials (MSW Mocks)

**Student Login:**
- National ID: `12345678901234`
- Email: `ahmed.mohamed@university.edu`
- Password: `password123`

**Teacher Login:**
- Email: `fatima.ali@university.edu`
- Password: `password123`

## 📁 Important Files

- **Logo Files**: `public/logo/logo.png.png` and `public/logo/icon.png.png`
- **Main App**: `src/App.tsx`
- **API Client**: `src/lib/api.ts`
- **Mock Handlers**: `src/mocks/handlers.ts`
- **i18n Config**: `src/lib/i18n.ts`

## 🎨 Design System

Colors are defined in `tailwind.config.js`:
- Primary: `#0055cc` (Dark Blue)
- Accent: `#ffd700` (Gold/Yellow)

## 🔄 Replacing Mocks

1. Update `VITE_API_BASE_URL` in `.env`
2. Ensure backend implements the same API endpoints
3. MSW automatically disabled in production

## 📚 Documentation

- Full README: `README.md`
- Setup Guide: `SETUP.md`
- Project Summary: `PROJECT_SUMMARY.md`

