Frontend folder structure for Hopping UI.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```
   VITE_API_URL=http://localhost:3001
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Folder Structure

- `src/` - Source code
  - `main.tsx` - App entry point
  - `App.tsx` - Root component
  - `components/` - Reusable React components
  - `pages/` - Page components
  - `hooks/` - Custom React hooks
  - `services/` - API calls to backend
  - `types/` - TypeScript interfaces
  - `utils/` - Helper functions
- `public/` - Static assets
- `index.html` - HTML entry point
