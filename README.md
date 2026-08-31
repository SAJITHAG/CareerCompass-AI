# CareerCompass AI — Personalized AI Career Guidance Assistant

A full-stack, conversational career guidance assistant. Students describe their skills, interests, education,
and goals; the app returns transparently-scored career matches, identifies missing skills, recommends real
courses from a Coursera dataset to close those gaps, and generates a learning roadmap — all through both a
guided assessment flow and a grounded AI chat assistant.

## Tech Stack

- **Frontend:** React + Vite, React Router, Axios
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas + Mongoose
- **AI:** Google Gemini (`gemini-3.6-flash`) — used only to *explain* data already retrieved from MongoDB, never to invent it
- **Dataset:** [Coursera Course Data](https://www.kaggle.com/datasets/azraimohamad/coursera-course-data) (623 real courses)

## Project Structure

```
careercompass-ai/
├── client/                 React + Vite frontend
│   ├── src/
│   │   ├── components/     layout/ (Navbar, Sidebar, AppLayout) and ui/ (Button, Card, Badge, MatchCircle, TagInput)
│   │   ├── pages/          Landing, Login, Register, Assessment, Results, CareerDetails, Roadmap, Chat, Dashboard, Profile
│   │   ├── services/       Axios wrappers per API domain (auth, career, course, chat)
│   │   ├── context/        AuthContext (global auth state)
│   │   ├── hooks/          useAuth
│   │   └── App.jsx         Route tree
│   └── .env.example
│
├── server/                 Express backend
│   ├── controllers/        Route handlers per domain
│   ├── models/             Course, Career, User (Mongoose schemas)
│   ├── routes/              API route definitions
│   ├── services/           careerMatchingService (scoring), courseService (retrieval), aiService (Gemini), chatService (intent + retrieval)
│   ├── middleware/         auth (JWT), errorHandler
│   ├── utils/               csvParsers, seedDatabase, generateToken
│   ├── data/                careers.js (knowledge base), coursera.csv (dataset — you provide this)
│   └── .env.example
│
└── README.md (this file)
```

## Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free tier is fine) and its connection string
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- The Coursera dataset CSV, placed at `server/data/coursera.csv`

## 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Import the dataset and career knowledge base into MongoDB:

```bash
npm run seed
```

You should see `Inserted 623 courses` and `Inserted 49 careers`.

Start the backend:

```bash
npm run dev
```

Verify it's running: `curl http://localhost:5000/api/health` should return `{"success":true,...}`.

## 2. Frontend Setup

In a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## 3. Try It End-to-End

1. Register an account on the app.
2. Complete the Career Assessment — fill in the form, upload a PDF/DOCX resume, or take/upload a photo of a printed resume to pre-fill it automatically.
3. Review your ranked career matches and match percentages.
4. Open a career's details to see missing skills and real course recommendations.
5. View the generated learning roadmap.
6. Select 2–3 careers on your results page and compare them side by side.
7. Ask the AI Chat Assistant a question, e.g. *"What skills am I missing for Data Scientist?"* — your conversation is saved and reloads next time you open the page.
8. Check the Dashboard for your saved match, skill progress, and roadmap completion.

## API Reference

| Method | Endpoint                | Auth | Description                                  |
|--------|--------------------------|------|-----------------------------------------------|
| POST   | `/api/auth/register`     | No   | Create an account                             |
| POST   | `/api/auth/login`        | No   | Log in                                        |
| GET    | `/api/auth/me`           | Yes  | Current user + profile                        |
| POST   | `/api/profile`           | Yes  | Update the student profile                    |
| POST   | `/api/profile/from-resume`| Yes | Extract a profile from an uploaded resume — PDF, DOCX, TXT, or a photo (JPG/PNG/WEBP) |
| POST   | `/api/career/analyze`    | No   | Score careers against a given profile         |
| POST   | `/api/career/custom`     | No   | "Type any career" — score a career outside the curated list, with its skills selected by AI from the real dataset vocabulary |
| GET    | `/api/careers`           | No   | List all careers                              |
| GET    | `/api/careers/:id`       | No   | Career detail                                 |
| POST   | `/api/courses/search`    | No   | Search courses by skills or free text         |
| GET    | `/api/courses/:id`       | No   | Course detail                                 |
| POST   | `/api/recommendations`   | No   | Combined career match + course recommendations|
| POST   | `/api/chat`              | Yes  | Conversational assistant, grounded in DB data |
| GET    | `/api/chat/history`      | Yes  | Load saved chat history                       |
| DELETE | `/api/chat/history`      | Yes  | Clear saved chat history                       |
| GET    | `/api/user/dashboard`    | Yes  | Career match, skills, courses, roadmap summary|

## Design Notes

- **Career matching is fully rule-based** (Skills 50% / Interests 25% / Goal 15% / Experience 10%) — no randomness,
  every score traces back to explicit overlaps. See `server/services/careerMatchingService.js`.
- **The AI never invents courses.** `aiService.js`'s system prompt, plus `chatService.js`'s retrieve-then-generate
  design, mean Gemini only ever explains or ranks courses that were already fetched from MongoDB in the same turn.
- **Career skill vocabulary is verified against the actual dataset**, not assumed. The Coursera dataset used here
  skews toward cloud/data/business terms and doesn't contain terms like "Node.js" or "MongoDB" — `server/data/careers.js`
  (49 curated careers, using 192 of the dataset's 328 skill terms across tech, data, business/finance, marketing, HR,
  operations/logistics, and a few niche technical roles) was written to match the dataset's real skill vocabulary,
  with fuzzy substring matching in `courseService.js` as a safety net. The remaining ~136 unused terms are documented
  in a comment at the top of the third batch in `careers.js` — mostly single-technology variants (AWS vs. the generic
  "Cloud Computing" already covering Cloud Engineer), pure math/stats course topics, and generic soft skills, none of
  which map to a standalone job title distinct from what's already curated.
- **"Type any career" stays grounded the same way.** `POST /api/career/custom` (`careerController.js` →
  `aiService.js#generateCustomCareerSkills`) lets a student score a career outside the curated 21. Gemini is only
  allowed to *select* required/optional skills from the dataset's real 328-term vocabulary (fetched live via
  `courseService.js#getSkillVocabulary`, never a separate hardcoded copy) — never invent new skill names — and its
  output is filtered again server-side against that same list before use. The result is scored by the identical
  `scoreCareerMatch()` engine as every curated career, so the match percentage is still fully deterministic; only the
  skill list itself comes from AI.
- **Resume upload reuses the same matching engine, never a separate one.** `POST /api/profile/from-resume` extracts
  text from the uploaded file (or, for photos, sends the image directly to Gemini's multimodal input, skipping OCR
  entirely) and asks Gemini to return the *exact same* `studentProfile` JSON shape the assessment form produces —
  the frontend pre-fills the same form with it for the student to review. Three input methods (form, document,
  photo), one recommendation engine to keep in sync.
- **PDF extraction uses `unpdf`, not `pdf-parse`.** `pdf-parse`'s bundled `pdf.js` (v1.10.100, from ~2020) gave
  inconsistent results on identical input across separate runs during testing — different error messages on repeated
  calls with the exact same file and code. `unpdf` (a thin, actively-maintained wrapper around current `pdf.js`)
  extracted the same text reliably every time across both a `reportlab`-generated and a LibreOffice-exported test PDF.

## Troubleshooting

- **"MONGODB_URI is not set"** — copy `.env.example` to `.env` in `server/` and fill in your Atlas connection string.
- **Chat/analysis returns 503** — `GEMINI_API_KEY` is missing or invalid in `server/.env`.
- **Seed script says dataset not found** — make sure `coursera_course_dataset_v3.csv` (or your version) is saved
  at `server/data/coursera.csv` exactly.
- **CORS errors in the browser** — confirm `CLIENT_URL` in `server/.env` matches the URL Vite is actually running on.
