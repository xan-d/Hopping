Backend folder structure for Hopping API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your environment variables:
   ```
   BACKEND_PORT=3001
   NODE_ENV=development
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

   Or start production:
   ```bash
   npm start
   ```

## Folder Structure

- `server.js` - Main Express server
- `helpers.js` - Utility functions (price formatting, URL handling)

## API Endpoints

- `GET /api/health` - Server health check
- `POST /api/fetch-meta` - Fetch product metadata from URL
- `GET /api/items` - Get all items (placeholder)
- `POST /api/items` - Create item (placeholder)
- `GET /api/boards` - Get all boards (placeholder)
- `POST /api/boards` - Create board (placeholder)

## Deployment

Deploy like PlantPartner:
```bash
npm install
pm2 start server.js --name hopping-api
```

