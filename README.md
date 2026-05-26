# Editorial Admin Panel

Standalone administration app for the Editorial news platform. **Runs separately** from the editor/public site.

## Ports

| App | Folder | Dev URL |
|-----|--------|---------|
| Editor + public site | `../` (repo root) | http://localhost:3000 |
| Admin panel | `admin-panel/` | http://localhost:3001 |

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

Use the **same** `MONGODB_URI` and `MONGODB_DB` as the main project. Set a dedicated `JWT_SECRET_ADMIN`.

2. Install and run:

```bash
cd admin-panel
npm install
npm run dev
```

3. Sign in at http://localhost:3001/login with an account that has `role: 'admin'` in MongoDB.

## Security

- Only `role: 'admin'` users can log in here.
- Uses `adminToken` cookie (not `authToken`).
- Admin login on the editor site (port 3000) is **blocked**.

## Uploads

Images uploaded from the admin panel are stored in `../public/uploads` so the public editor site can serve them.
