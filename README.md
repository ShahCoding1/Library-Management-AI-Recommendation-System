# 📚 Book Recommendation, Screen-Time & Library Management System

> **A University Final Year Project (FYP)** combining Atomic Library Circulation, Scikit-Learn Hybrid AI Recommendations (TF-IDF & Collaborative Filtering), 18-Profile Mood Discovery, and Live Screen-Time Analytics.

---

## 🌟 Key Highlights & Tri-Pillar Architecture

### 1. 📖 Library Circulation & Inventory Management
* **Transactional Concurrency:** Thread-safe copy-level checkout, renewals, returns, and inventory locking.
* **14-Day Loan Rules:** Dynamic due-date calculations, renewal limit controls (max 2 per loan), and automatic overdue penalties.
* **Waitlist Reservations:** Queue position assignment (`#1`, `#2`, etc.) when all physical copies are checked out.
* **Audit Trail:** Immutable ledger capturing all issue, renewal, return, and inventory adjustment events.

### 2. 🧠 Hybrid Machine Learning Recommender Engine
* **Content-Based Filtering:** Scikit-Learn TF-IDF vectorization across book synopses, authors, genres, and themes with Cosine Similarity calculations.
* **Item-Based Collaborative Filtering:** User-item rating matrix calculating peer affinities.
* **18-Profile Mood Discovery:** Mood-driven filtering matching books to emotional and atmospheric profiles.
* **Transparent Reason Generation:** Explains to the user *why* a book was recommended (e.g. *"Because you rated Crime and Punishment 5★"* or *"Matches Melancholic mood"*).
* **Evaluated Metrics (K=5):** Precision@5: `0.500`, Recall@5: `0.875`, Hit Rate@5: `1.000`, NDCG@5: `0.830`.

### 3. ⏱️ Screen-Time & Reading Analytics Telemetry
* **Live Heartbeat Timer:** Telemetry updates every 30 seconds with inactivity caps.
* **Habit Streaks & Goals:** Daily streak counters, longest streak tracking, and daily reading goal progress bars.
* **Visual Breakdown:** 7-day screen-time bar charts and thematic mood/genre distribution footprints.

---

## 🚀 Quick Start (Windows CMD)

### Option A: One-Click Simultaneous Launch
Simply run the root batch script:
```cmd
start_servers.bat
```

### Option B: Manual Terminal Execution

#### 1. Backend API (Django REST Framework)
```cmd
cd "backend"
python manage.py runserver 127.0.0.1:8000
```
*API Base URL:* `http://127.0.0.1:8000/api/v1/`

#### 2. Frontend Web App (React 19 + Vite)
```cmd
cd "frontend"
node "node_modules/vite/bin/vite.js" --host
```
*App URL:* `http://localhost:5173`

---

## 🧪 Running System Test Suite
Execute the full automated verification suite:
```cmd
run_tests.bat
```
This executes:
1. **Django Unit & API Tests:** `python manage.py test` (5/5 Passed)
2. **ML Recommender Evaluation:** `python manage.py evaluate_recommendation_model`
3. **Frontend Production Build:** Vite bundle compilation (Passed in <1s)

---

## 🔑 Demo & Defense Accounts

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Reader / Patron** | `reader@library.com` | `Reader123!` | Catalog, Mood Discovery, Loans, Wishlist, Timer, Reviews |
| **Librarian** | `librarian@library.com` | `Admin123!` | Circulation Desk, Loan Records, Inventory Management |
| **Admin** | `admin@library.com` | `Admin123!` | Full System Control, User Accounts, Rec Debugger, Audit Logs |

---

## 📡 REST API Endpoint Summary

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login/` | JWT access & refresh token pair |
| **Auth** | `POST` | `/api/v1/auth/register/` | Patron registration |
| **Auth** | `GET` | `/api/v1/auth/me/` | Current user profile |
| **Catalog** | `GET` | `/api/v1/books/` | Paginated catalog with multi-filter |
| **Catalog** | `GET` | `/api/v1/books/{id}/` | Full book profile with metadata |
| **Catalog** | `GET` | `/api/v1/books/{id}/similar/` | TF-IDF Cosine similar books |
| **Catalog** | `POST` | `/api/v1/books/{id}/rate/` | Submit 1–5 star rating |
| **Catalog** | `GET` | `/api/v1/books/moods/` | 18 mood discovery profiles |
| **Search** | `GET` | `/api/v1/search/` | Multi-criteria search engine |
| **Search** | `GET` | `/api/v1/search/autocomplete/` | Real-time search suggestions |
| **Recommendations** | `GET` | `/api/v1/recommendations/me/` | Personalized hybrid recommendations |
| **Recommendations** | `GET` | `/api/v1/recommendations/mood/{slug}/` | Mood-filtered curated recommendations |
| **Circulation** | `POST` | `/api/v1/library/borrow/` | Borrow physical copy (14 days) |
| **Circulation** | `POST` | `/api/v1/library/return/` | Process book return |
| **Circulation** | `POST` | `/api/v1/library/renew/` | Extend loan by 14 days (max 2) |
| **Circulation** | `POST` | `/api/v1/library/reserve/` | Join waitlist queue |
| **Circulation** | `GET` | `/api/v1/library/my-loans/` | Patron loan status |
| **Screen-Time** | `POST` | `/api/v1/analytics/reading-sessions/start/` | Start live timer session |
| **Screen-Time** | `POST` | `/api/v1/analytics/reading-sessions/{id}/heartbeat/` | 30s session pulse |
| **Screen-Time** | `POST` | `/api/v1/analytics/reading-sessions/{id}/end/` | Finalize reading duration & streak |
| **Screen-Time** | `GET` | `/api/v1/analytics/user/` | User screen-time & streak analytics |
| **Admin** | `GET` | `/api/v1/analytics/admin/` | Platform-wide KPIs & trends |
| **Admin** | `GET` | `/api/v1/recommendations/admin/debug/` | ML vector and score inspector |
