# 📚 Book Recommendation, Screen-Time & Library Management System

### An Intelligent, Full-Stack Library Platform Powered by AI-Driven Book Discovery and Reading Analytics

[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-Backend-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-Frontend-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-Machine%20Learning-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-Not%20Specified-lightgrey)](#license)

---

## 📖 Project Overview

**Book Recommendation, Screen-Time & Library Management System** is a full-stack software engineering Final Year Project (FYP) designed to combine traditional library management with intelligent book discovery, personalized recommendation techniques, and reading-activity analytics.

The project explores how modern web technologies, structured data management, and machine learning can improve the experience of discovering, managing, and interacting with books.

Unlike conventional library management systems that primarily focus on book inventory and borrowing records, this project places additional emphasis on **personalized book recommendations, mood-based advanced search, and meaningful reading engagement analysis**.

It is designed around three interconnected domains:

1. **Library Management:** Organizing books, readers, inventory, borrowing, returns, and administrative workflows.
2. **Intelligent Book Discovery:** Helping readers find relevant books through advanced search, mood classification, and recommendation algorithms.
3. **Reading and Screen-Time Analytics:** Supporting reading-session tracking, engagement statistics, and progress visualization.

The system follows a modular, API-driven architecture intended to support maintainability, extensibility, security, and future enhancements.

---

## 🎯 Project Objectives

The primary objectives of this project are to:

- Design a centralized, web-based library management platform.
- Simplify the discovery and organization of books.
- Support advanced search using multiple book attributes.
- Introduce mood-based book discovery for a more intuitive browsing experience.
- Explore machine learning techniques for personalized book recommendations.
- Analyze user interactions to improve recommendation relevance.
- Track meaningful reading sessions and application engagement.
- Provide dashboards for readers and library administrators.
- Implement secure authentication and role-based access control.
- Apply professional software engineering principles across the application.

---

## ✨ Core Features

### 📚 1. Library and Book Management

The library management component is designed to support the essential operations of a modern library.

**Functional scope:**

- Book catalog and detailed book profiles
- Author and genre management
- Book categories, tags, and mood classifications
- Inventory and availability management
- Book borrowing and return workflows
- Reservation management
- User profiles and borrowing history
- Ratings and written reviews
- Favorites and wishlists
- Librarian and administrator workflows

The system is intended to maintain accurate inventory records and consistent borrowing transactions.

### 🔍 2. Advanced Book Search

Advanced search is one of the central features of this project.

Readers can discover books using combinations of relevant attributes rather than relying exclusively on a book title.

**Search dimensions include:**

- Book title
- Author
- Genre and category
- Mood
- Tags
- Language
- Publication year
- Reader rating
- Availability
- Page count
- ISBN

The search design also considers filtering, sorting, pagination, and search suggestions.

### 💜 3. Mood-Based Book Discovery

One of the project's distinguishing concepts is the ability to discover books according to a reader's selected mood or desired reading experience.

**Example mood categories:**

| Mood | Discovery purpose |
|---|---|
| Romantic | Romance-oriented stories and themes |
| Historical | Books with historical subjects or settings |
| Inspirational | Uplifting and inspiring reading |
| Motivational | Personal growth and motivational content |
| Sad | Emotionally moving or melancholic themes |
| Happy | Cheerful and lighthearted reading |
| Mysterious | Mystery and intrigue |
| Adventurous | Exploration and adventure |
| Philosophical | Reflective and thought-provoking content |
| Relaxing | Calm and comforting reading |

The system is designed to support combinations such as **Romantic + Historical** or **Motivational + Inspirational**.

Mood classification is treated as a book-discovery mechanism, not as a psychological or medical assessment.

---

## 🧠 AI-Powered Book Recommendation System

The recommendation engine is a major intelligent component of the project.

Its objective is to identify books that may be relevant to a reader based on book metadata, preferences, and interactions.

### Recommendation Approaches

The project specification defines a hybrid recommendation architecture incorporating the following techniques.

**Content-Based Filtering**

Content-based recommendation identifies similarities between books using descriptive information such as titles, descriptions, authors, genres, categories, moods, and tags.

A baseline implementation can use:

- Text preprocessing
- TF-IDF vectorization
- Cosine similarity
- User preference vectors

**Collaborative Filtering**

Collaborative filtering considers patterns across readers' interactions with books.

For example, books positively received by readers with overlapping interests may become recommendation candidates for one another.

The planned approach includes user–book interaction matrices and item-based collaborative relationships.

**Mood-Based Recommendation**

Selected moods and previously expressed reading preferences can contribute to candidate selection and ranking.

**Interaction-Based Personalization**

Reader activity can provide recommendation signals, including:

- Ratings
- Favorites
- Wishlist additions
- Borrowing history
- Book views
- Recommendation interactions

Positive and negative feedback are considered separately.

### Hybrid Recommendation Architecture

```text
                   BOOK METADATA
                         |
                   USER PREFERENCES
                         |
                   USER INTERACTIONS
                         |
                         v
                 FEATURE ENGINEERING
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
     Content-Based   Collaborative   Mood Matching
       Filtering       Filtering
          |              |              |
          +--------------+--------------+
                         |
                         v
              HYBRID RELEVANCE SCORING
                         |
                         v
                CANDIDATE FILTERING
                         |
                         v
                 DIVERSIFICATION
                         |
                         v
              EXPLAINABLE RESULTS
                         |
                         v
               RECOMMENDED BOOKS
```

### Recommendation Scoring

The proposed hybrid model combines normalized recommendation signals.

```text
Final Score =
    W_content       × Content Score
  + W_collaborative × Collaborative Score
  + W_mood          × Mood Score
  + W_preference    × Preference Score
  + W_popularity    × Popularity Score
  + W_rating        × Rating Score
  + W_recency       × Recency Score
  + W_availability  × Availability Score
```

The weights are intended to be configurable and should be evaluated experimentally rather than assumed to be universally optimal.

### Cold-Start Handling

The design considers situations where sufficient interaction history is unavailable.

For new readers, recommendation candidates can be selected using explicitly chosen preferences, popular books, highly rated books, and recent additions.

For new books, descriptive metadata allows content-based matching even when no interaction history exists.

### Explainable Recommendations

The recommendation interface is designed to provide meaningful reasons for suggestions, such as:

- Similar to books you enjoyed
- Matches your preferred genre
- Matches your selected mood
- Popular among readers with similar interests
- Highly rated in a relevant category

Explanations should be generated from actual recommendation signals rather than fabricated descriptions.

---

## ⏱️ Screen-Time and Reading Analytics

The analytics component is designed to help readers understand their activity and reading habits.

### Reading Session Tracking

A reading session can include:

- Associated reader
- Selected book
- Session start and end times
- Recorded duration
- Pages read, when applicable
- Activity source

### Reader Analytics

The planned dashboard includes:

| Metric | Description |
|---|---|
| Daily reading time | Recorded reading activity for the day |
| Weekly reading time | Reading activity during the week |
| Monthly reading time | Monthly engagement summary |
| Average session duration | Average duration of recorded sessions |
| Reading streak | Consecutive periods of recorded reading |
| Books completed | Books marked as completed |
| Reading goals | Progress toward selected targets |
| Reading trends | Historical activity visualization |

**Measurement principle:** Application usage time and actual reading time are not automatically equivalent. The system design distinguishes these concepts to avoid misleading analytics.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Programming language | Python |
| Backend framework | Django |
| API framework | Django REST Framework |
| Frontend library | React |
| Frontend development tool | Vite |
| Frontend language | JavaScript |
| Database access | Django ORM |
| Local database | SQLite, where configured |
| Production database target | PostgreSQL |
| Machine learning | Scikit-learn |
| Numerical processing | NumPy |
| Data processing | pandas, where applicable |
| Recommendation techniques | TF-IDF, cosine similarity, collaborative filtering |
| Version control | Git and GitHub |
| API architecture | REST |

---

## 🏗️ System Architecture

The project uses a separation between the presentation layer, backend services, and persistent data.

```text
                    +----------------------+
                    |        USER          |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |    REACT FRONTEND    |
                    |    Vite / JavaScript |
                    +----------+-----------+
                               |
                               | REST API
                               v
                    +----------------------+
                    |    DJANGO BACKEND    |
                    | Django REST Framework|
                    +----------+-----------+
                               |
             +-----------------+------------------+
             |                 |                  |
             v                 v                  v
     +---------------+ +---------------+ +---------------+
     |    LIBRARY    | | RECOMMENDATION| |   ANALYTICS   |
     |   SERVICES    | |    ENGINE     | |   SERVICES    |
     +---------------+ +---------------+ +---------------+
             |                 |                  |
             +-----------------+------------------+
                               |
                               v
                    +----------------------+
                    |      DJANGO ORM      |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |       DATABASE       |
                    +----------------------+
```

The architectural goal is to keep substantial business logic inside backend services rather than embedding it directly in frontend components.

---

## 📂 Project Structure

The local application is organized around separate frontend and backend directories.

```text
LibraryManagementSystem/
|
|-- backend/
|   |-- manage.py
|   |-- requirements.txt
|   |-- ...
|
|-- frontend/
|   |-- package.json
|   |-- package-lock.json
|   |-- src/
|   |-- ...
|
|-- start_servers.bat
|-- README.md
|-- .gitignore
```

Additional folders and modules may vary according to the implementation.

---

## 🚀 Getting Started

These instructions describe local development on Windows using PowerShell.

### Prerequisites

Install the following tools:

- Python
- Node.js and npm
- Git
- A code editor such as Visual Studio Code

Verify the installations:

```powershell
python --version
node --version
npm --version
git --version
```

### 1. Clone the Repository

```powershell
git clone https://github.com/ShahCoding1/Library-Management-AI-Recommendation-System.git
```

Navigate into the project:

```powershell
cd Library-Management-AI-Recommendation-System
```

### 2. Configure the Backend

Navigate to the backend directory:

```powershell
cd backend
```

Create a Python virtual environment:

```powershell
python -m venv venv
```

Install dependencies using the virtual environment's Python interpreter:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

If the application provides an `.env.example` file, copy it to `.env` and configure the required environment variables.

### 3. Apply Database Migrations

```powershell
.\venv\Scripts\python.exe manage.py migrate
```

### 4. Start the Django Backend

```powershell
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Backend development address:

**http://127.0.0.1:8000/**

Keep this terminal running.

### 5. Configure the Frontend

Open another PowerShell terminal and navigate to the cloned project directory.

```powershell
cd Library-Management-AI-Recommendation-System\frontend
```

Install frontend dependencies:

```powershell
npm install
```

Start the frontend development server:

```powershell
npm run dev
```

The default Vite development address is:

**http://localhost:5173/**

Open the address displayed by Vite in your browser.

### 6. Run the Application

Both development servers should remain active.

| Service | Development address |
|---|---|
| Django backend | http://127.0.0.1:8000 |
| React frontend | http://localhost:5173 |

**Note:** Database content, environment configuration, and trained recommendation artifacts may require additional local setup depending on the repository contents.

---

## 🔌 REST API Design

The project specification proposes versioned REST endpoints.

Representative endpoint groups include:

```text
/api/v1/auth/
/api/v1/users/
/api/v1/books/
/api/v1/authors/
/api/v1/genres/
/api/v1/moods/
/api/v1/search/
/api/v1/loans/
/api/v1/reservations/
/api/v1/recommendations/
/api/v1/reading/
/api/v1/analytics/
/api/v1/admin/
```

These paths describe the intended API structure. Actual available endpoints should be confirmed against the Django URL configuration.

---

## 🗄️ Database Design

The planned database model includes entities representing:

**Accounts and users:** Users, profiles, roles, and preferences.

**Books and metadata:** Books, authors, genres, categories, moods, and tags.

**Library operations:** Inventory items, loans, reservations, and returns.

**Reader interactions:** Favorites, wishlists, ratings, reviews, and reading sessions.

**Intelligent features:** Search events, recommendation events, and recommendation records.

**Administration:** Notifications, audit logs, and system settings.

The design emphasizes relational integrity, validation, indexing, and transaction-safe operations.

---

## 🔐 Security and Data Integrity

Security is an important part of the system's engineering requirements.

The specification emphasizes:

- Secure password hashing
- Authentication and authorization
- Role-based access control
- Backend input validation
- Protection against unauthorized data access
- Secure handling of uploaded files
- Environment-based secret management
- Safe database operations
- Transactional inventory updates
- Appropriate error handling
- Administrative audit logging

Sensitive information, local databases, virtual environments, and dependency directories should not be committed to the public repository.

---

## 🧪 Testing and Quality Assurance

The project defines a testing strategy covering:

- Unit tests for business logic
- Backend API tests
- Database integration tests
- Authentication and authorization tests
- Library borrowing and return workflows
- Advanced search and mood filtering
- Recommendation ranking and cold-start behavior
- Reading-session and analytics functionality
- Security validation
- Frontend interactions

### Run Django Tests

From the backend directory:

```powershell
.\venv\Scripts\python.exe manage.py test
```

### Check Django Configuration

```powershell
.\venv\Scripts\python.exe manage.py check
```

### Build the Frontend

From the frontend directory:

```powershell
npm run build
```

Test coverage and results should be reported from actual execution rather than assumed.

---

## 📊 Recommendation Evaluation

The project specification includes several evaluation measures for assessing recommendation quality.

| Metric | Purpose |
|---|---|
| Precision@K | Relevance among the top K recommendations |
| Recall@K | Coverage of relevant items within the top K |
| Hit Rate@K | Whether at least one relevant item is recommended |
| NDCG@K | Ranking quality with position-aware relevance |
| Catalog coverage | Diversity of books receiving recommendation exposure |
| Diversity | Variety among recommended items |
| Click-through rate | Reader engagement with displayed recommendations |

Meaningful evaluation requires suitable interaction data and an appropriate evaluation protocol.

Synthetic demonstration data should be clearly distinguished from real-world usage data.

---

## 🌱 Future Enhancements

Potential improvements include:

- More advanced hybrid recommendation optimization
- Larger book datasets
- Improved recommendation explanations
- Personalized reading plans
- Expanded recommendation evaluation
- More detailed reading insights
- Mobile application support
- Improved accessibility
- Cloud deployment
- Scalable background model training
- Expanded notification workflows
- Additional librarian reporting tools

These enhancements represent possible future work, not claims about currently implemented functionality.

---

## 🎓 Academic Context

This project was developed as part of the **Bachelor of Science in Software Engineering** at:

**City University of Science and Information Technology (CUSIT), Peshawar, Pakistan.**

It brings together concepts from:

- Software Engineering
- Web Engineering
- Database Systems
- Artificial Intelligence
- Data Structures and Algorithms
- Software Design and Architecture
- Human-Computer Interaction
- Software Quality Engineering

The project demonstrates an interdisciplinary approach to full-stack application development, intelligent information retrieval, and user-focused software design.

---

## 👨‍💻 Developer

**Muhammad Shah Khalid**

BS Software Engineering  
City University of Science and Information Technology (CUSIT), Peshawar, Pakistan

**GitHub:** [@ShahCoding1](https://github.com/ShahCoding1)

**Repository:** [Library Management AI Recommendation System](https://github.com/ShahCoding1/Library-Management-AI-Recommendation-System)

---

## 📄 License

No open-source license has been specified for this repository.

A suitable license may be added in the future if the project is intended for open-source distribution.

---

### ⭐ Support the Project

If you find this project interesting or useful, consider starring the repository.

**Built with a focus on intelligent book discovery, practical software engineering, and meaningful reading experiences.**
