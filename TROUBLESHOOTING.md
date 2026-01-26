# Troubleshooting Guide

## MSW Service Worker Issues

### Error: "The script has an unsupported MIME type ('text/html')"

This error occurs when MSW cannot find or load the `mockServiceWorker.js` file.

#### Solution Steps:

1. **Ensure the service worker file exists:**
   ```bash
   npx msw init public/ --save
   ```
   This should create `public/mockServiceWorker.js`

2. **Restart the development server:**
   - Stop the current dev server (Ctrl+C)
   - Start it again: `npm run dev`

3. **Clear browser cache:**
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Clear storage" or "Clear site data"
   - Refresh the page

4. **Check if the file is accessible:**
   - Open `http://localhost:3000/mockServiceWorker.js` in your browser
   - You should see JavaScript code, not HTML

5. **Verify file location:**
   - The file should be at: `public/mockServiceWorker.js`
   - Not in `src/` or root directory

### If MSW Still Doesn't Work:

1. **Disable MSW temporarily:**
   - The app will work without MSW, but API calls will fail
   - You'll need a real backend running

2. **Check browser console:**
   - Look for any additional error messages
   - Check Network tab to see if the file is being requested

3. **Try a different browser:**
   - Some browsers have stricter service worker policies
   - Try Chrome or Firefox

4. **Check Vite configuration:**
   - Ensure `publicDir: 'public'` is set in `vite.config.ts`

### Alternative: Use Node.js MSW (for testing)

If browser MSW continues to have issues, you can use Node.js MSW for tests only:

```typescript
// In test files
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

export const server = setupServer(...handlers)
```

## Common Issues

### Port Already in Use

If port 3000 is already in use:
```bash
# Kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change the port in vite.config.ts
server: {
  port: 3001, // Change to available port
}
```

### Module Not Found Errors

If you see module not found errors:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors

If you see TypeScript errors:
```bash
# Check TypeScript version
npx tsc --version

# Run type check
npx tsc --noEmit
```

## Getting Help

1. Check the browser console for detailed error messages
2. Check the terminal for build/compilation errors
3. Review the MSW documentation: https://mswjs.io/docs/
4. Check Vite documentation: https://vitejs.dev/

