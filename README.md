# MERN AI Flow

A full-stack MERN application that uses **React Flow** to visualize an AI prompt-response pipeline. Type a prompt in the Input Node, click **Run Flow**, and see the AI's answer appear in the Result Node — all connected by an animated edge.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Tailwind CSS + React Flow |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| AI | OpenRouter API (free models) |



## Prerequisites

- **Node.js** 
- **MongoDB** — either local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **OpenRouter API Key** — free at [openrouter.ai](https://openrouter.ai)

---

## Setup & Run

### Step 1 — Clone / download the repo

```bash
git clone <your-repo-url>
cd mern-ai-flow
```

### Step 2 — Backend

```bash
cd backend
npm install
```

```env
MONGODB_URI=mongodb://localhost:27017/MERN_APP
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
PORT=5000
```



Start the backend:

```bash
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

### Step 3 — Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## How to Use

1. **Type** your question in the **Input Node** (e.g., *"What is the capital of France?"*)
2. Click **▶ Run Flow** in the header
3. Watch the **Result Node** populate with the AI's answer
4. Click **💾 Save to DB** to store the conversation in MongoDB
5. Click **📋 History** to view past saved conversations

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ask-ai` | Send `{ prompt }` → returns `{ response }` |
| `POST` | `/api/save` | Send `{ prompt, response }` → saves to MongoDB |
| `GET` | `/api/history` | Returns last 10 saved conversations |

---

## Deployment

### Backend (Render.com)
1. Push your code to GitHub
2. Create a new **Web Service** on Render
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables in Render dashboard

### Frontend (Vercel)
1. Create a new project on Vercel
2. Set root directory to `frontend`
3. In `vite.config.js`, update the proxy target to your Render backend URL for production
   OR set `VITE_API_URL` env variable and update axios calls

---

## Notes

- The free OpenRouter model used is `google/gemini-2.0-flash-lite-preview-02-05:free`
- Never expose your OpenRouter API key in the frontend — all AI calls go through the backend
