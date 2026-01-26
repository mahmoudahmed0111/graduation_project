# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_PUBLIC_UNIVERSITY_SLUG=beni-suef
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open http://localhost:3000 in your browser

## Mock Credentials

For testing with MSW mocks:

- **National ID**: `12345678901234`
- **Email**: `ahmed.mohamed@university.edu` or `fatima.ali@university.edu`
- **Password**: `password123`

## Replacing Mocks with Real API

1. Update `VITE_API_BASE_URL` in `.env` to point to your backend
2. Ensure your backend implements these endpoints:
   - `POST /api/auth/login`
   - `POST /api/auth/register`
   - `POST /api/auth/refresh`
   - `POST /api/auth/logout`
   - `GET /api/universities/:id/meta`
   - `GET /api/universities`
   - `GET /api/courses`
   - `GET /api/enrollments`

3. MSW will automatically be disabled in production builds

## Logo Files

The application expects logo files at:
- `/logo/logo.png.png` - Main logo (used in login/register)
- `/logo/icon.png.png` - Icon (used in sidebar)

These files should be placed in the `public/logo/` directory.

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## Building for Production

```bash
npm run build
```

The output will be in the `dist/` directory.

