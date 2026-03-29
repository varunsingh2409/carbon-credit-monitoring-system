# Dependency Installation Commands

This file contains copy-pasteable commands to install the dependencies required for the Carbon Credit Monitoring System.

It covers:

- backend Python dependencies
- frontend Node.js dependencies
- environment file setup
- migration command
- startup commands
- explicit package-by-package install commands

## 1. Prerequisites

Install these on your machine first:

- Python 3.10 or newer
- Node.js 18 or newer
- npm 9 or newer
- PostgreSQL

This project expects a running PostgreSQL database before the backend can fully work.

## 2. Recommended Backend Install

Run these commands from:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend`

### PowerShell

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

## 3. Recommended Frontend Install

Run these commands from:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend`

```powershell
npm install
Copy-Item .env.example .env
```

## 4. Exact Backend Dependency Command

If you want to install the backend packages manually instead of using `requirements.txt`, use:

```powershell
pip install `
  fastapi==0.104.1 `
  "uvicorn[standard]==0.24.0" `
  sqlalchemy==2.0.23 `
  psycopg2-binary==2.9.9 `
  requests==2.32.3 `
  "python-jose[cryptography]==3.3.0" `
  "passlib[bcrypt]==1.7.4" `
  python-multipart==0.0.6 `
  pydantic==2.5.0 `
  pydantic-settings==2.1.0 `
  python-dotenv==1.0.0 `
  alembic==1.13.0
```

## 5. Exact Frontend Dependency Commands

If you want to install the frontend packages manually instead of using `npm install`, use these.

### Runtime dependencies

```powershell
npm install `
  react@18.2.0 `
  react-dom@18.2.0 `
  react-router-dom@6.30.3 `
  zustand@4.4.7 `
  axios@1.13.6 `
  react-hook-form@7.49.2 `
  zod@3.22.4 `
  @hookform/resolvers@3.3.3 `
  date-fns@3.0.0 `
  recharts@2.10.3 `
  lucide-react@0.294.0 `
  clsx@2.0.0 `
  tailwind-merge@2.2.0 `
  react-hot-toast@2.4.1
```

### Dev dependencies

```powershell
npm install -D `
  @types/react@18.2.43 `
  @types/react-dom@18.2.17 `
  @vitejs/plugin-react@4.7.0 `
  autoprefixer@10.4.16 `
  postcss@8.4.32 `
  tailwindcss@3.4.1 `
  typescript@5.3.3 `
  vite@8.0.1
```

## 6. Environment File Setup

### Backend `.env`

From the project root:

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and set at least:

- `DATABASE_URL`
- `SECRET_KEY`

### Frontend `.env`

From the frontend folder:

```powershell
Copy-Item .env.example .env
```

Expected frontend value:

```env
VITE_API_URL=http://localhost:8000
```

## 7. Database Migration Command

After backend dependencies are installed and the database is configured:

```powershell
alembic upgrade head
```

## 8. Start Commands

### Backend

From the project root:

```powershell
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

From the frontend folder:

```powershell
npm run dev
```

## 9. Build Commands

### Frontend production build

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend
npm run build
```

## 10. One-Time Full Setup Flow

If you want the shortest complete setup flow, use these commands in order.

### Backend full setup

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend full setup

Open a second terminal:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

## 11. Quick Verification

After installation:

- backend root should open at `http://127.0.0.1:8000`
- backend docs should open at `http://127.0.0.1:8000/docs`
- frontend should open at `http://localhost:5173`

## 12. Notes

- The safest way to install backend packages is still `pip install -r requirements.txt`
- The safest way to install frontend packages is still `npm install`
- The exact commands above are useful if you want to recreate the dependency set manually
- PostgreSQL server installation itself is not managed by this repository, but the app requires it
