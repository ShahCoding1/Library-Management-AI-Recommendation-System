# BOOK RECOMMENDATION, SCREEN-TIME & LIBRARY MANAGEMENT SYSTEM
## Master Full-Stack + AI Development Specification
### Production-Quality FYP Implementation Prompt

---

# 0. ROLE AND MISSION

You are a senior software architect, full-stack engineer, AI/ML engineer, database engineer, security engineer, UI/UX designer, QA engineer, DevOps engineer, and technical documentation specialist.

You are responsible for designing and implementing the complete project described in this document.

Treat this as a serious university Final Year Project (FYP), not as a toy CRUD application.

The final application must be:

- fully functional
- modular
- maintainable
- secure
- responsive
- accessible
- testable
- documented
- visually polished
- API-driven
- database-backed
- AI/recommendation enabled
- suitable for academic demonstration and viva
- suitable for future production extension

Do not create fake AI functionality, hard-coded recommendations, fake analytics, placeholder business logic, or decorative features that do not actually work.

When a feature is described as AI-powered, implement a real algorithm or a clearly documented rule-based fallback.

When a requirement is ambiguous, choose the most professional, maintainable, secure, and academically defensible implementation rather than inventing unnecessary complexity.

---

# 1. PROJECT TITLE

## Book Recommendation, Screen-Time & Library Management System

The system combines three major domains:

1. Library Management
2. Intelligent Book Recommendation
3. User Reading / Screen-Time Analytics

It must also include an advanced search and discovery system, especially allowing users to discover books by mood such as:

- Sad
- Romantic
- Historical
- Inspirational
- Motivational
- Emotional
- Happy
- Mysterious
- Adventurous
- Relaxing
- Educational
- Philosophical
- Dark
- Humorous
- Suspenseful
- Nostalgic
- Hopeful
- Dramatic

The mood system must be implemented as a content/discovery feature, not as a psychological or medical assessment.

---

# 2. CORE PROJECT OBJECTIVE

Build a complete web-based library platform where users can:

- create an account
- log in securely
- browse books
- search books
- use advanced filters
- search by mood
- search by genre
- search by author
- view detailed book information
- rate books
- favorite books
- add books to a wishlist
- borrow/request books
- return books
- track reading activity
- track reading duration
- view screen-time/reading-time analytics
- receive personalized recommendations
- see explanations for recommendations
- manage their profile
- review their activity
- discover similar books

Administrators/librarians must be able to:

- manage books
- manage authors
- manage categories/genres
- manage moods/tags
- manage users
- manage inventory
- manage borrowing
- manage returns
- manage overdue records
- manage reservations
- manage ratings/reviews
- monitor analytics
- monitor recommendation activity
- manage system settings

---

# 3. PRIMARY USERS

The application must support at least:

## 3.1 Guest

Can:

- view public landing page
- browse public catalog
- search books
- use basic/advanced search
- view book details
- view public information

Cannot:

- borrow
- rate
- favorite
- access personalized recommendations
- access personal analytics

Prompt guest users to authenticate when required.

---

## 3.2 Registered User / Reader

Can:

- access personal dashboard
- manage profile
- browse catalog
- search
- use mood discovery
- rate books
- review books
- favorite books
- wishlist books
- borrow/request books
- return books
- track reading sessions
- view reading/screen-time analytics
- receive personalized recommendations
- provide recommendation feedback
- view reading history

---

## 3.3 Librarian

Can:

- manage library inventory
- issue books
- process returns
- manage reservations
- manage overdue records
- manage book availability
- view library operational analytics

---

## 3.4 Administrator

Can access all appropriate administrative functionality:

- users
- roles
- books
- authors
- genres
- moods
- tags
- inventory
- loans
- reservations
- ratings
- recommendations
- analytics
- system settings
- audit logs

Use role-based access control.

---

# 4. RECOMMENDED TECHNOLOGY STACK

Use a professional architecture.

## Backend

Preferred:

- Python
- Django
- Django REST Framework

Use:

- Django ORM
- Django authentication
- Django permissions
- REST APIs
- service-layer architecture

---

## Frontend

Preferred:

- React
- modern JavaScript
- responsive component-based UI
- REST API integration

Use a professional UI component strategy.

---

## Database

Preferred:

- PostgreSQL for production
- SQLite may be used for lightweight local development if necessary

The database design must remain compatible with PostgreSQL.

---

## Machine Learning / Recommendation

Preferred:

- Python
- scikit-learn
- NumPy
- pandas where appropriate

Potential algorithms:

- TF-IDF
- cosine similarity
- collaborative filtering
- hybrid ranking
- normalized weighted scoring

Do not introduce deep learning merely for appearance.

---

## Development Tools

Use:

- Git
- GitHub
- environment variables
- virtual environment
- dependency management
- API testing
- automated tests
- linting/formatting

---

# 5. HIGH-LEVEL ARCHITECTURE

Use a modular architecture:

```text
                         USER
                           |
                           v
                    React Frontend
                           |
                           v
                    REST API Layer
                           |
             +-------------+-------------+
             |                           |
             v                           v
       Application Services        Authentication
             |
     +-------+--------+-------------------+
     |       |        |                   |
     v       v        v                   v
 Library  Search  Recommendation      Analytics
 Service  Service    Engine            Service
     |       |        |                   |
     +-------+--------+-------------------+
             |
             v
          Django ORM
             |
             v
        PostgreSQL
```

Recommendation subsystem:

```text
User Preferences
       |
User Interactions
       |
Book Metadata
       |
       v
Feature Engineering
       |
+------+------+------+------+
|      |      |      |      |
v      v      v      v      v
Content Collaborative Mood Preferences Popularity
|      |      |      |      |
+------+------+------+------+
       |
       v
Hybrid Scoring
       |
       v
Filtering
       |
       v
Diversification
       |
       v
Explanation
       |
       v
Recommendations
```

---

# 6. DEVELOPMENT PRINCIPLES

Follow these principles throughout the project:

- DRY
- SOLID where appropriate
- separation of concerns
- reusable components
- service-oriented business logic
- secure defaults
- meaningful naming
- explicit validation
- database constraints
- transaction safety
- proper error handling
- logging
- automated tests
- API versioning where useful
- documentation
- accessibility
- responsive design

Do not put complex recommendation or borrowing logic directly inside React components.

Do not put all backend logic inside Django views.

Use services/modules for substantial business logic.

---

# 7. PROJECT STRUCTURE

Use a structure conceptually similar to:

```text
project-root/
│
├── backend/
│   ├── manage.py
│   ├── config/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── books/
│   │   ├── library/
│   │   ├── recommendations/
│   │   ├── analytics/
│   │   ├── search/
│   │   └── common/
│   ├── requirements/
│   ├── tests/
│   └── media/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── utils/
│   │   └── assets/
│   └── tests/
│
├── ml/
│   ├── training/
│   ├── inference/
│   ├── artifacts/
│   └── evaluation/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── ml/
│   └── deployment/
│
├── scripts/
├── .env.example
├── .gitignore
├── README.md
└── docker-compose.yml
```

Adapt names to the chosen implementation while preserving separation.

---

# 8. DATABASE DESIGN

Create a normalized relational database.

Minimum entities:

- User
- UserProfile
- Role
- Book
- Author
- Genre
- Category
- Mood
- Tag
- BookMood
- BookTag
- BookAuthor
- InventoryItem
- Loan
- Reservation
- Favorite
- Wishlist
- Rating
- Review
- ReadingSession
- SearchEvent
- Recommendation
- RecommendationEvent
- UserPreference
- Notification
- AuditLog
- SystemSetting

Use appropriate foreign keys, indexes, uniqueness constraints, timestamps, and deletion policies.

---

# 9. USER MODEL

User should contain or connect to:

- id
- name
- email
- password hash
- role
- active status
- date joined
- last login

Never store plaintext passwords.

Use Django's secure password hashing.

---

# 10. USER PROFILE

Profile may include:

- profile image
- biography
- preferred genres
- preferred moods
- preferred authors
- reading goal
- notification preferences

Do not store sensitive psychological conclusions.

---

# 11. BOOK MODEL

Book should support:

- id
- ISBN where applicable
- title
- subtitle
- description
- cover image
- publication date
- publisher
- language
- page count
- author(s)
- genre(s)
- category
- mood(s)
- tags
- availability status
- created_at
- updated_at

Use meaningful indexes for frequently searched fields.

---

# 12. AUTHOR MODEL

Fields:

- id
- name
- biography
- photo
- nationality where appropriate
- birth information only where legitimately needed
- created_at
- updated_at

Avoid collecting unnecessary personal information.

---

# 13. GENRE/CATEGORY SYSTEM

Create normalized genre/category entities.

Examples:

- Fiction
- Non-Fiction
- Science
- Technology
- History
- Biography
- Romance
- Mystery
- Fantasy
- Self-Development
- Education
- Literature

Allow books to have multiple relevant classifications.

---

# 14. MOOD SYSTEM

Create a dedicated Mood entity.

Example records:

- Sad
- Romantic
- Historical
- Inspirational
- Motivational
- Emotional
- Happy
- Mysterious
- Adventurous
- Relaxing
- Educational
- Philosophical
- Dark
- Humorous
- Suspenseful
- Nostalgic
- Hopeful
- Dramatic

Moods should describe content/discovery characteristics.

Do not infer mental-health conditions.

---

# 15. TAG SYSTEM

Tags allow finer-grained discovery.

Examples:

- World War II
- Artificial Intelligence
- Programming
- Personal Growth
- Leadership
- Friendship
- Family
- Adventure
- Space
- Cybersecurity

---

# 16. INVENTORY

Inventory must support physical/digital availability as appropriate.

Track:

- total copies
- available copies
- borrowed copies
- reserved copies
- damaged/lost copies
- status

Never allow available copies to become negative.

Use transactions around issue/return operations.

---

# 17. BORROWING SYSTEM

User can request/borrow an available book.

Loan record:

- user
- book
- copy if physical inventory is tracked
- issue date
- due date
- return date
- status
- renewal count
- notes

Statuses:

- pending
- active
- returned
- overdue
- lost
- cancelled

---

# 18. RETURN PROCESS

On return:

1. validate ownership/loan
2. update loan
3. update inventory
4. record return timestamp
5. calculate lateness if applicable
6. update analytics
7. trigger relevant notifications
8. update recommendation interaction signals

All related database changes should be transactional.

---

# 19. RESERVATION SYSTEM

Users can reserve books that are unavailable.

Support:

- reservation date
- queue position
- status
- notification when available
- expiry

---

# 20. FAVORITES

Allow users to favorite/unfavorite books.

Favorite action becomes a positive recommendation signal.

---

# 21. WISHLIST

Allow users to save books for later.

Wishlist is a weaker positive signal than a high rating/favorite.

---

# 22. RATING SYSTEM

Use 1–5 stars.

Validate:

- integer only
- minimum 1
- maximum 5
- one active rating per user/book unless editing is explicitly supported

Rating becomes a recommendation signal.

---

# 23. REVIEW SYSTEM

Users may optionally provide text reviews.

Support:

- moderation
- editing
- deletion according to permissions
- timestamps

Prevent inappropriate content where practical.

---

# 24. ADVANCED SEARCH

Search must be a major project feature.

Support:

- title
- author
- genre
- category
- mood
- tag
- language
- publication year
- rating
- availability
- page count
- ISBN

Allow multiple filters simultaneously.

---

# 25. MOOD-BASED ADVANCED SEARCH

This is an explicit requirement of the FYP.

Users must be able to search:

> books for a sad mood

or:

> romantic books

or:

> historical + emotional books

or:

> motivational + inspirational books

The UI should make this intuitive.

---

# 26. ADVANCED SEARCH UI

Provide:

- search bar
- mood chips
- genre selector
- author selector
- category selector
- rating filter
- availability filter
- publication-year range
- language
- tag selector
- clear filters
- sorting

Sorting options:

- relevance
- newest
- oldest
- rating
- popularity
- title
- availability

---

# 27. SEARCH RESULT CARD

Each book card should show:

- cover
- title
- author
- genre
- mood tags
- rating
- availability
- short description
- action buttons

---

# 28. SEARCH AUTOCOMPLETE

Implement autocomplete where useful.

Search suggestions may include:

- book titles
- authors
- genres
- moods
- tags

Do not perform expensive full-database operations on every keystroke.

Use debouncing.

---

# 29. SEARCH ENGINE DESIGN

For a manageable FYP dataset, PostgreSQL search or optimized Django ORM search is sufficient.

Do not add Elasticsearch unless genuinely justified.

---

# 30. SEARCH VS RECOMMENDATION

Keep these concepts separate.

Search answers:

> What books match my query?

Recommendation answers:

> What books may I like?

A search query must not be silently replaced by personalized recommendations.

Recommendations can appear alongside search results as an additional section.

---

# 31. SCREEN-TIME / READING-TIME FEATURE

The project must track meaningful user reading/application activity.

Use the terminology consistently.

Possible metrics:

- session duration
- daily reading time
- weekly reading time
- monthly reading time
- books read
- pages read where available
- average session duration
- reading streak
- goal progress

If the application is intended to measure application usage rather than actual physical reading, label it accurately as application/session time.

Do not claim that screen time automatically equals real-world reading time.

---

# 32. READING SESSION

Create:

ReadingSession

Fields may include:

- user
- book
- started_at
- ended_at
- duration_seconds
- pages_read
- source
- created_at

Validate unreasonable durations.

---

# 33. SESSION LOGIC

When a reading session starts:

Create session.

When it ends:

Calculate duration server-side where possible.

Do not blindly trust client-provided duration.

Handle:

- browser closed
- network failure
- inactivity
- duplicate requests

---

# 34. INACTIVITY

Optionally pause/end sessions after configurable inactivity.

Example:

```text
No meaningful activity for configured threshold
        ↓
Session paused
```

The threshold must be configurable.

---

# 35. SCREEN-TIME DASHBOARD

Show:

- Today
- This Week
- This Month
- Total
- Average session
- Reading streak
- Goal progress

Charts:

- daily reading time
- weekly trend
- genre distribution
- mood distribution
- books completed

Do not create misleading charts.

---

# 36. READING GOALS

Allow users to set goals such as:

- minutes per day
- minutes per week
- books per month

Display progress.

---

# 37. ANALYTICS

Dashboard should contain useful analytics.

User analytics:

- books borrowed
- books completed
- favorite genres
- favorite moods
- reading time
- recent activity
- recommendations
- goals

Admin analytics:

- total users
- active users
- books
- loans
- overdue loans
- popular books
- popular genres
- popular moods
- recommendation engagement
- reading-time trends

---

# 38. RECOMMENDATION ENGINE

The recommendation engine is a core intelligent subsystem.

Do not hard-code recommendations.

Use a hybrid architecture combining:

1. Content-Based Filtering
2. Collaborative Filtering
3. Mood Matching
4. Explicit Preferences
5. User Interactions
6. Popularity
7. Rating signals
8. Recency
9. Availability
10. Diversity

---

# 39. CONTENT-BASED RECOMMENDER

Represent each book using meaningful text:

- title
- subtitle
- description
- author
- genres
- categories
- moods
- tags

Build a combined text profile.

---

# 40. TEXT PREPROCESSING

Normalize:

- lowercase
- whitespace
- missing values
- punctuation where appropriate

Do not destroy meaningful metadata.

---

# 41. TF-IDF

Use TF-IDF as the baseline content representation.

Pipeline:

```text
Book metadata
   ↓
Combined text profile
   ↓
Preprocessing
   ↓
TF-IDF
   ↓
Book feature matrix
```

---

# 42. COSINE SIMILARITY

Use cosine similarity to determine similarity between book vectors.

This supports:

> Similar Books

and contributes to personalized recommendations.

---

# 43. USER PROFILE VECTOR

Construct a user preference vector from interacted-with books.

Conceptually:

```text
User Profile =
Σ(Book Vector × Interaction Weight)
```

Normalize the result.

---

# 44. INTERACTION WEIGHTS

Use configurable weights.

Example baseline:

```text
5-star rating        +5
4-star rating        +4
3-star rating        +2
2-star rating        -2
1-star rating        -5
Favorite             +4
Borrow               +3
Wishlist             +2
Recommendation click +2
Book view             +1
```

These are starting values, not universal truths.

Keep them configurable and document them.

---

# 45. NEGATIVE SIGNALS

Negative interactions must matter.

Examples:

- 1-star rating
- Not Interested
- hidden recommendation

A single negative interaction must not permanently eliminate an entire genre.

---

# 46. COLLABORATIVE FILTERING

Create a user-book interaction matrix.

Example:

```text
          Book A Book B Book C Book D
User 1      5      4      0      0
User 2      5      0      4      3
User 3      0      5      4      0
```

Zero means no known interaction, not automatic dislike.

---

# 47. ITEM-BASED COLLABORATIVE FILTERING

Prefer item-based collaborative filtering where appropriate.

Example:

Users who interacted positively with Book A also interacted with Book B.

Therefore Book B becomes a candidate for users who liked Book A.

This differs from content similarity.

---

# 48. COLLABORATIVE SCORE

Generate a normalized collaborative relevance score for candidate books.

Only rely strongly on collaborative filtering when sufficient interaction data exists.

---

# 49. MOOD RECOMMENDATION

Mood is a dedicated signal.

If a user selects:

> Romantic

the system should prioritize books tagged/classified as Romantic.

If:

> Romantic + Historical

is selected, prioritize books matching both.

---

# 50. MOOD PREFERENCE PROFILE

Mood preference can come from:

Explicit:

- selected mood
- preferred mood

Implicit:

- repeated mood searches
- clicks
- favorites
- borrowing
- high ratings

Represent these as preference scores, not psychological labels.

---

# 51. MOOD SEARCH VS MOOD RECOMMENDATION

Search:

> Find Romantic books.

Recommendation:

> This user often interacts positively with Romantic books, so similar content may be recommended.

These must remain distinct.

---

# 52. EXPLICIT PREFERENCES

Store:

- preferred genres
- preferred moods
- preferred authors
- preferred categories

Use them in personalization.

---

# 53. POPULARITY SIGNAL

Popularity may use:

- views
- favorites
- borrowing
- rating count

Do not confuse popularity with quality.

---

# 54. RATING SIGNAL

Consider:

- average rating
- rating count

Avoid treating one 5-star rating as stronger evidence than hundreds of consistent ratings.

Use a reasonable confidence adjustment where practical.

---

# 55. RECENCY SIGNAL

Recently added books may receive a modest recency score.

Recency must not overwhelm relevance.

---

# 56. AVAILABILITY SIGNAL

If the user wants borrowable books:

prioritize currently available books.

Unavailable books may still be recommended if reservations are supported.

---

# 57. HYBRID SCORE

Combine normalized component scores.

Conceptually:

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

Weights must be configurable.

Do not claim weights are optimal unless experimentally learned.

---

# 58. SCORE NORMALIZATION

Do not blindly add scores from incompatible ranges.

Normalize component scores before hybrid combination.

Document the normalization method.

---

# 59. CANDIDATE GENERATION

Generate candidates from:

- content similarity
- collaborative relationships
- mood matches
- preferences
- popularity
- recent books

Merge and deduplicate.

---

# 60. CANDIDATE FILTERING

Remove candidates that are:

- inactive
- invalid
- hidden
- explicitly rejected
- inappropriate for the context

Normally exclude already-consumed books unless a “revisit” feature is intended.

---

# 61. DIVERSIFICATION

Do not return ten nearly identical books.

Diversify across:

- authors
- genres
- moods

while preserving relevance.

---

# 62. TOP-K

Support configurable K.

Examples:

- 5
- 10
- 20

Different contexts can use different limits.

---

# 63. RECOMMENDATION CONTEXTS

Support:

### Homepage
Recommended for You

### Book page
Similar Books

### Mood page
Books for Your Mood

### User dashboard
Based on Your Activity

### After borrowing
You May Also Like

Each context can have different weights.

---

# 64. COLD START — NEW USER

If user has no interactions:

Use:

1. explicit preferences
2. mood preferences
3. genre preferences
4. author preferences
5. popular books
6. highly rated books
7. recent books

Do not attempt collaborative personalization without data.

---

# 65. COLD START — NEW BOOK

New books can still be recommended because content metadata is available.

Use:

- title
- description
- author
- genre
- mood
- tags

Content-based recommendation solves this case better than pure collaborative filtering.

---

# 66. EXTREME COLD START

If there are no meaningful preferences or metadata:

use popular/highly rated/recent books.

Do not pretend the result is personalized.

---

# 67. MODEL LIFECYCLE

Do not retrain expensive components on every HTTP request.

Model workflow:

```text
Book data changes
      ↓
Rebuild requested
      ↓
Feature extraction
      ↓
TF-IDF training
      ↓
Similarity/index creation
      ↓
Artifact persistence
      ↓
Recommendation service loads artifact
```

---

# 68. MODEL ARTIFACTS

Potential artifacts:

- TF-IDF vectorizer
- book feature matrix
- similarity/index data
- configuration
- model metadata

Do not load untrusted serialized artifacts.

---

# 69. MODEL VERSIONING

Store:

- version
- creation timestamp
- training-data version/hash
- algorithm
- configuration
- weights

---

# 70. RECOMMENDATION SERVICES

Create logical services:

```text
ContentBasedRecommender
CollaborativeRecommender
MoodRecommendationService
HybridRecommendationService
RecommendationExplanationService
```

Keep responsibilities separate.

---

# 71. RECOMMENDATION API

Provide endpoints such as:

```text
GET /api/v1/recommendations/
GET /api/v1/users/me/recommendations/
GET /api/v1/books/{id}/similar/
GET /api/v1/recommendations/mood/{slug}/
```

Support:

- context
- limit
- mood
- genre
- other appropriate filters

---

# 72. RECOMMENDATION RESPONSE

Return useful information:

```json
{
  "results": [
    {
      "book": {
        "id": 42,
        "title": "Example Book"
      },
      "reason": "Matches your interest in historical and emotional books.",
      "context": "homepage"
    }
  ]
}
```

Do not expose unnecessary internal model data to normal users.

---

# 73. EXPLAINABLE RECOMMENDATIONS

Every recommendation should have a meaningful explanation when possible.

Examples:

- Similar to books you enjoyed
- Matches your preferred mood
- Popular among readers with similar interests
- Matches your favorite genre
- Highly rated in this category

The explanation must correspond to actual signals.

Do not fabricate explanations.

---

# 74. RECOMMENDATION EVENTS

Track where appropriate:

- displayed
- clicked
- favorited
- borrowed
- rated

This enables evaluation.

---

# 75. RECOMMENDATION METRICS

Track:

- impressions
- clicks
- CTR
- borrow conversions
- empty recommendation rate
- recommendation errors

---

# 76. ML EVALUATION

If sufficient data exists, evaluate:

- Precision@K
- Recall@K
- Hit Rate@K
- NDCG@K
- catalog coverage
- diversity
- novelty where useful

Do not fabricate metrics.

If using synthetic/seeded data, clearly label results as such.

---

# 77. TIME-AWARE EVALUATION

Where sufficient historical data exists, prefer:

```text
Past interactions → training
Future interactions → evaluation
```

Avoid careless data leakage.

---

# 78. ADMIN RECOMMENDATION DEBUGGING

Admin/developer debugging should optionally show:

- candidate
- content score
- collaborative score
- mood score
- preference score
- popularity score
- rating score
- final score
- recommendation source

This is valuable for FYP demonstration.

---

# 79. SEARCH EVENTS

Track meaningful search behavior where appropriate:

- query
- filters
- mood
- timestamp
- result count
- clicked result

Use this data as a recommendation signal only where justified.

---

# 80. RECOMMENDATION PROFILE UPDATE

After meaningful events:

- rating
- favorite
- borrow
- wishlist
- meaningful click

update user preference signals.

---

# 81. RECENCY DECAY

Older interactions may have lower influence.

Conceptually:

```text
Effective Weight =
Interaction Weight × Recency Factor
```

Do not overreact to a single recent interaction.

---

# 82. USER CONTROL

Allow:

- Not Interested
- Hide Recommendation
- Remove from Favorites
- Remove from Wishlist

Respect explicit negative feedback.

---

# 83. FRONTEND DESIGN

Create a professional responsive interface.

Use:

- consistent spacing
- typography hierarchy
- cards
- tables
- dialogs
- drawers
- tabs
- filters
- charts
- notifications
- loading states
- empty states
- error states

Avoid excessive decoration.

---

# 84. LANDING PAGE

Include:

- project introduction
- featured books
- popular books
- mood discovery
- recommendation preview for authenticated users
- search
- login/register
- project value proposition

---

# 85. USER DASHBOARD

Sections:

- greeting
- reading statistics
- current loans
- reading goal
- recommended books
- recently viewed
- favorites
- mood discovery
- reading activity chart
- quick actions

---

# 86. BOOK DETAILS PAGE

Show:

- cover
- title
- author
- description
- genres
- moods
- tags
- publication details
- availability
- rating
- reviews
- borrow button
- favorite button
- wishlist button
- similar books
- recommendation explanation where applicable

---

# 87. MOOD DISCOVERY PAGE

Create visually appealing mood chips/cards.

Examples:

- Sad
- Romantic
- Historical
- Inspirational
- Motivational
- Emotional
- Happy
- Mysterious
- Adventurous
- Relaxing

Clicking a mood leads to filtered discovery.

---

# 88. ADVANCED SEARCH PAGE

Use a two-column or responsive filter layout.

Desktop:

```text
Filters | Results
```

Mobile:

```text
Filter button
Results
```

Provide clear/reset controls.

---

# 89. ADMIN DASHBOARD

Include:

- KPIs
- user statistics
- book statistics
- loan statistics
- overdue count
- popular books
- popular moods
- recommendation metrics
- reading trends

---

# 90. BOOK MANAGEMENT

Admin CRUD:

- create
- read
- update
- archive/delete according to policy

Validation:

- required title
- valid metadata
- author
- genre
- mood
- inventory consistency

---

# 91. USER MANAGEMENT

Admin can:

- search users
- activate/deactivate accounts
- assign appropriate roles
- view borrowing status
- review activity where authorized

Do not expose passwords.

---

# 92. AUTHENTICATION

Support:

- registration
- login
- logout
- password hashing
- password reset
- session/token management
- protected routes
- role checks

Use secure authentication practices.

---

# 93. AUTHORIZATION

Use role-based access control.

Every privileged API must verify permissions server-side.

Never rely only on hiding a frontend button.

---

# 94. API SECURITY

Implement:

- authentication
- authorization
- input validation
- rate limiting where appropriate
- CSRF protection where applicable
- CORS configuration
- secure headers
- safe error responses
- pagination
- query limits

---

# 95. DATA VALIDATION

Validate on both:

Frontend:
- usability

Backend:
- actual security/business correctness

Backend validation is authoritative.

---

# 96. SQL INJECTION

Use Django ORM safely.

Do not build SQL strings from untrusted input.

If raw SQL is necessary, parameterize it.

---

# 97. XSS

Sanitize/escape user-generated content appropriately.

Reviews and profile fields must not allow unsafe script execution.

---

# 98. FILE UPLOADS

For book covers/profile images:

Validate:

- file type
- file size
- filename handling
- storage location

Do not trust file extensions alone.

---

# 99. ENVIRONMENT VARIABLES

Never hard-code:

- secret keys
- database passwords
- API keys
- production credentials

Provide:

```text
.env.example
```

with safe placeholder values.

---

# 100. LOGGING

Implement structured logging for:

- authentication errors
- API errors
- borrowing failures
- recommendation failures
- model rebuilds
- critical admin actions

Do not log passwords or sensitive secrets.

---

# 101. AUDIT LOG

For important administrative actions record:

- actor
- action
- object/type
- timestamp
- safe metadata

Examples:

- book created
- book archived
- user role changed
- inventory adjusted
- loan manually changed

---

# 102. NOTIFICATIONS

Support notifications for:

- loan issued
- due soon
- overdue
- return completed
- reservation available
- recommendation-related events where appropriate

---

# 103. EMAIL

If email is implemented:

- verification
- password reset
- reservation availability
- overdue reminder

Use configurable email provider settings.

---

# 104. ERROR HANDLING

Frontend:

- friendly message
- retry where appropriate
- no raw stack traces

Backend:

- structured error responses
- useful logs
- appropriate HTTP status codes

---

# 105. LOADING STATES

Every asynchronous frontend operation should have an appropriate loading state.

Examples:

- skeleton cards
- spinner
- disabled submit button
- progress indicator

---

# 106. EMPTY STATES

Design useful empty states:

- no books
- no favorites
- no recommendations
- no reading history
- no current loans
- no search results

Include helpful next actions.

---

# 107. PAGINATION

Use pagination for large datasets.

Avoid loading thousands of books into the browser.

---

# 108. PERFORMANCE

Optimize:

- database indexes
- select_related/prefetch_related
- pagination
- caching
- recommendation artifacts
- frontend rendering
- image sizes
- API payloads

Avoid N+1 database queries.

---

# 109. DATABASE INDEXES

Index frequently filtered fields such as:

- ISBN
- title where appropriate
- author relations
- genre relations
- mood relations
- availability
- created_at
- user_id
- book_id
- loan status
- timestamps

Measure before adding excessive indexes.

---

# 110. CACHING

Cache:

- popular books
- public catalog metadata
- expensive recommendation artifacts
- safe aggregate statistics

Never accidentally cache personalized responses globally.

---

# 111. RESPONSIVE DESIGN

Support:

- desktop
- laptop
- tablet
- mobile

Do not build a desktop-only system.

---

# 112. ACCESSIBILITY

Implement:

- keyboard navigation
- semantic HTML
- accessible labels
- sufficient contrast
- focus states
- alt text
- screen-reader-friendly controls

---

# 113. FRONTEND STATE

Use a consistent state management approach.

Separate:

- server state
- UI state
- authentication state
- form state

Avoid unnecessary global state.

---

# 114. API SERVICE LAYER

Create centralized API functions.

Do not scatter raw fetch calls across every component.

Handle:

- authentication
- errors
- retries
- response normalization

---

# 115. FORMS

Forms must include:

- validation
- clear labels
- error messages
- loading state
- success feedback
- accessibility

---

# 116. BOOK CARD COMPONENT

Reusable component should support:

- cover
- title
- author
- rating
- moods
- availability
- favorite
- wishlist
- view details

---

# 117. RECOMMENDATION CARD

Should display:

- book
- recommendation reason
- relevant mood/genre indicators
- action buttons

Do not show raw model scores to ordinary users.

---

# 118. CHARTS

Use charts for:

- reading time
- books per month
- genre distribution
- mood distribution
- admin analytics

Charts must have labels and useful tooltips.

---

# 119. MOBILE UX

On mobile:

- filters become drawer/modal
- cards adapt
- tables may become stacked cards
- navigation becomes mobile-friendly
- charts remain readable

---

# 120. NOTIFICATIONS UX

Use toast/snackbar notifications for short feedback.

Use persistent notification center for important events.

---

# 121. API VERSIONING

Prefer:

```text
/api/v1/
```

This makes future evolution easier.

---

# 122. SAMPLE API GROUPS

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

---

# 123. DOCUMENTATION

Create:

- README
- installation guide
- environment setup
- architecture documentation
- database documentation
- API documentation
- recommendation documentation
- testing documentation
- deployment documentation
- user guide
- admin guide

---

# 124. README

README should include:

- project overview
- features
- architecture
- technology stack
- prerequisites
- installation
- environment variables
- database setup
- migrations
- seed data
- ML model setup
- running backend
- running frontend
- testing
- deployment

---

# 125. DATABASE SEEDING

Provide realistic seed data.

Seed:

- users
- books
- authors
- genres
- moods
- tags
- inventory
- sample interactions

Do not use meaningless fake data like:

Book 1
Book 2
Book 3

Use realistic but clearly fictional/demo data if necessary.

---

# 126. DEMO DATA FOR RECOMMENDATION

Create enough interaction diversity to demonstrate:

- content similarity
- collaborative filtering
- mood matching
- cold start
- negative feedback
- popularity
- diversity

Clearly label seeded data as demo/test data.

---

# 127. TESTING STRATEGY

Implement:

### Unit tests
Services and models.

### Integration tests
Database + API.

### API tests
Authentication and endpoints.

### Frontend tests
Important components and flows.

### Recommendation tests
Scoring and candidate generation.

### Security tests
Authorization and input validation.

---

# 128. CRITICAL TEST CASES

Test:

- registration
- login
- logout
- unauthorized API access
- role restriction
- book creation
- book editing
- borrowing
- return
- reservation
- rating
- favorite
- wishlist
- advanced search
- mood search
- recommendation
- cold start
- negative feedback
- reading session
- analytics

---

# 129. RECOMMENDATION TEST CASES

At minimum test:

1. Similar books are returned.
2. Mood filtering works.
3. User preferences influence ranking.
4. Positive ratings influence ranking.
5. Negative ratings reduce related relevance.
6. New users get fallback recommendations.
7. New books can be recommended from metadata.
8. Already consumed books are handled correctly.
9. Inactive books are filtered.
10. Hybrid scores are deterministic for fixed inputs.
11. Explanations match actual signals.
12. Recommendation errors have fallbacks.

---

# 130. PERFORMANCE TESTING

Measure:

- API response times
- search response
- recommendation response
- database queries
- page load
- model loading

Optimize based on evidence.

---

# 131. SECURITY TESTING

Test:

- unauthorized access
- privilege escalation
- invalid input
- malicious payloads
- file upload abuse
- insecure direct object references
- authentication bypass
- rate-limit behavior

---

# 132. DATA INTEGRITY

Use:

- database constraints
- transactions
- unique constraints
- foreign keys
- validation

Example:

Two simultaneous borrow requests must not cause the same single copy to be issued twice.

---

# 133. CONCURRENCY

Borrow/return operations must be transaction-safe.

Use appropriate locking/atomic operations.

---

# 134. BACKUP STRATEGY

Document:

- database backups
- media backups
- ML artifact backups
- restoration process

---

# 135. DEPLOYMENT

Prepare for deployment.

Backend:

- production settings
- PostgreSQL
- static/media configuration
- secure secret management

Frontend:

- production build
- environment configuration

---

# 136. DOCKER

If practical, provide:

- backend Dockerfile
- frontend Dockerfile
- PostgreSQL service
- docker-compose configuration

Do not make Docker mandatory if it unnecessarily complicates the educational deployment.

---

# 137. PRODUCTION CONFIGURATION

Never use development settings in production.

Separate:

```text
development
testing
production
```

---

# 138. CI/CD

If practical, configure GitHub Actions for:

- install dependencies
- lint
- test
- build frontend
- validate backend

---

# 139. GIT WORKFLOW

Use meaningful commits.

Examples:

```text
feat: implement book catalog
feat: add mood based search
feat: implement hybrid recommendation engine
feat: add reading session analytics
fix: prevent duplicate borrowing
test: add recommendation service tests
docs: add deployment guide
```

Avoid commits like:

```text
update
changes
final
asdf
```

---

# 140. UI DESIGN LANGUAGE

The application should feel like a modern digital library.

Visual direction:

- clean
- professional
- calm
- readable
- modern
- not overloaded

Use consistent:

- typography
- spacing
- radius
- shadows
- icons
- buttons
- form styles

---

# 141. ACCESSIBILITY OF MOOD CHIPS

Mood chips must:

- have clear text
- show selected state
- support keyboard navigation
- have accessible labels
- allow deselection

---

# 142. SEARCH UX EXAMPLE

User types:

```text
historical
```

Then may select:

```text
Mood:
Emotional

Genre:
Historical Fiction

Rating:
4+

Availability:
Available
```

Result should dynamically update.

---

# 143. ADVANCED SEARCH EXAMPLE

User chooses:

```text
Mood:
Romantic
Historical

Genre:
Fiction

Rating:
4+
```

The result ranking should prioritize books matching multiple criteria.

---

# 144. BOOK DETAIL RECOMMENDATION

On a book detail page:

```text
Similar Books
```

should primarily use content similarity.

Also optionally show:

```text
Readers Also Liked
```

based on collaborative interactions.

Keep these sections conceptually distinct.

---

# 145. USER DASHBOARD RECOMMENDATIONS

Show:

```text
Recommended For You
```

using the full hybrid engine.

Potential explanation:

> Based on your interest in historical and emotional books.

---

# 146. MOOD DASHBOARD

Show:

```text
What are you in the mood for?
```

Then mood cards.

This becomes a major discovery feature of the project.

---

# 147. SCREEN-TIME / READING ANALYTICS EXAMPLE

Show:

```text
Today
1h 24m

This Week
6h 42m

Books Read
4

Current Streak
7 days
```

All numbers must come from actual database data.

Do not hard-code dashboard statistics.

---

# 148. ADMIN ANALYTICS EXAMPLE

Show:

```text
Total Books
Registered Users
Active Loans
Overdue Loans
Popular Genre
Popular Mood
Recommendation CTR
Average Reading Time
```

All values must be computed.

---

# 149. NOTIFICATION EXAMPLES

Examples:

> Your reserved book is now available.

> Your borrowed book is due tomorrow.

> Your reading goal is 80% complete.

Use clear, concise language.

---

# 150. BUSINESS RULES

Examples:

- users cannot borrow unavailable books unless reservation is enabled
- available copies cannot be negative
- a user cannot borrow the same copy simultaneously
- ratings must be valid
- only authorized roles can manage inventory
- recommendation data must be user-isolated
- deleted/archived books must not break historical loans
- returned loans cannot be returned again

---

# 151. SOFT DELETE

For important historical records, prefer archiving/deactivation rather than destructive deletion where appropriate.

Historical loan and analytics data should remain consistent.

---

# 152. API PAGINATION

Return pagination metadata where appropriate:

- count
- next
- previous
- results

---

# 153. API FILTERING

Allow server-side filtering.

Do not download the entire database to the frontend and filter locally.

---

# 154. API SORTING

Validate allowed sorting fields.

Never allow arbitrary SQL expressions from clients.

---

# 155. API DOCUMENTATION

Use OpenAPI/Swagger or another suitable API documentation system if practical.

Document:

- endpoint
- method
- parameters
- authentication
- response
- errors

---

# 156. ERROR RESPONSE FORMAT

Use a consistent API error structure.

Example:

```json
{
  "error": {
    "code": "BOOK_UNAVAILABLE",
    "message": "This book is currently unavailable."
  }
}
```

Do not expose stack traces.

---

# 157. FRONTEND ERROR UX

For API errors:

- show friendly message
- preserve form input where possible
- allow retry
- log technical details separately

---

# 158. MODEL EXPLANABILITY

The recommendation system should be explainable at FYP level.

Be able to demonstrate:

```text
Why was this book recommended?

Because:
- it is similar to books the user rated highly
- it matches the user's preferred mood
- similar users interacted positively with it
```

Only display reasons supported by actual scoring data.

---

# 159. RECOMMENDATION DEBUG EXAMPLE

For demonstration, developer/admin mode may show:

```text
Book: Example Historical Novel

Content Score: 0.81
Collaborative Score: 0.62
Mood Score: 0.95
Preference Score: 0.80
Popularity Score: 0.61
Rating Score: 0.88

Final Score: 0.82
```

These are example values only.

The actual application must calculate them.

---

# 160. MODEL CONFIGURATION

Put configurable values in one place.

Examples:

```text
CONTENT_WEIGHT
COLLABORATIVE_WEIGHT
MOOD_WEIGHT
PREFERENCE_WEIGHT
POPULARITY_WEIGHT
RATING_WEIGHT
RECENCY_WEIGHT
AVAILABILITY_WEIGHT
TOP_K
MIN_COLLABORATIVE_INTERACTIONS
SESSION_TIMEOUT
```

Do not scatter magic numbers throughout the code.

---

# 161. RECOMMENDATION FALLBACK

If any model is unavailable:

```text
Collaborative unavailable
        ↓
Content + Mood + Preferences
```

If personalization unavailable:

```text
Popular + Highly Rated + Recent
```

The user should still see useful books.

---

# 162. RECOMMENDATION SAFETY

Do not infer:

- mental illness
- personality disorders
- sensitive traits
- medical conditions

from mood searches or reading behavior.

Mood is a content preference.

---

# 163. PRIVACY

Only collect data needed for functionality.

Users should be able to understand what is tracked.

Reading/session/recommendation data must be protected.

---

# 164. USER DATA ISOLATION

Never allow:

```text
/api/v1/users/2/recommendations/
```

to expose User 2's personalized information to User 1 without proper authorization.

Prefer `/me/` endpoints for self-service.

---

# 165. ADMIN PRIVACY

Even administrators should only access user behavioral data when their role and project requirements justify it.

Log sensitive administrative access where appropriate.

---

# 166. INTERNATIONALIZATION READINESS

Structure text so future localization is possible.

Do not hard-code user-facing strings throughout business logic.

---

# 167. TIME ZONES

Store timestamps consistently.

Use timezone-aware datetimes.

Display dates/times appropriately for the user.

---

# 168. IMAGE OPTIMIZATION

Book covers should be:

- resized
- compressed
- validated
- served efficiently

Avoid massive original files.

---

# 169. SEARCH RELEVANCE

Search ranking should consider:

- exact title match
- title partial match
- author match
- genre/mood/tag match
- description relevance

Do not make every search result purely popularity-based.

---

# 170. SEARCH EMPTY RESULT

If no result:

Show:

> No books matched your filters.

Then provide:

- clear filters
- popular books
- related moods
- suggested genres

---

# 171. BOOK COVER FALLBACK

If no cover exists:

show a professional placeholder.

Do not break the layout.

---

# 172. AUTHOR FALLBACK

If author information is missing:

display a safe fallback rather than crashing.

---

# 173. DATA IMPORT

If seed/import functionality is implemented:

Validate every imported record.

Reject or report malformed rows.

Do not silently corrupt database data.

---

# 174. ADMIN BULK OPERATIONS

Where practical:

- bulk activate/archive
- bulk mood assignment
- bulk category assignment
- bulk inventory adjustment

All bulk actions must validate permissions and data.

---

# 175. AUDITABILITY

Important business operations should leave a trace.

Examples:

- who changed inventory
- who issued a manual loan
- who changed a role
- who archived a book

---

# 176. USER EXPERIENCE FLOW

Typical flow:

```text
Landing Page
   ↓
Register/Login
   ↓
Onboarding Preferences
   ↓
Dashboard
   ↓
Browse/Search
   ↓
Book Details
   ↓
Favorite/Wishlist/Borrow
   ↓
Reading Session
   ↓
Rating/Review
   ↓
Personalized Recommendations
   ↓
Analytics
```

---

# 177. NEW USER ONBOARDING

After registration, optionally ask:

- favorite genres
- favorite moods
- favorite authors
- reading goals

This improves cold-start recommendations.

Allow skipping.

---

# 178. ONBOARDING MUST NOT BLOCK USER

User can skip preference setup and still use the application.

Fallback recommendation engine should handle this.

---

# 179. RECOMMENDATION FEEDBACK LOOP

The system should evolve from:

```text
User Action
   ↓
Event
   ↓
Preference Signal
   ↓
Recommendation
   ↓
New User Action
```

This creates the feedback loop central to personalization.

---

# 180. SCREEN-TIME FEEDBACK LOOP

Reading sessions update:

- total reading time
- goals
- streaks
- activity analytics

They may also contribute to recommendation confidence if the user meaningfully interacts with books.

Do not treat duration alone as proof of liking a book.

---

# 181. RECOMMENDATION EVENT ATTRIBUTION

If a user clicks a recommendation and later borrows the book, attribution should be defined consistently.

Document the chosen attribution window/rule.

---

# 182. DATA QUALITY

Before recommendation training:

Check:

- missing metadata
- duplicate books
- invalid genres
- invalid moods
- orphaned relations
- malformed descriptions

Bad metadata directly damages content recommendation quality.

---

# 183. DUPLICATE BOOKS

Prevent accidental duplicate catalog entries where possible.

Use ISBN or a documented uniqueness strategy.

Do not assume title alone is always unique.

---

# 184. MODEL DATA PIPELINE

The model pipeline should be reproducible.

```text
Database
   ↓
Data extraction
   ↓
Cleaning
   ↓
Feature engineering
   ↓
Training/index generation
   ↓
Evaluation
   ↓
Artifact persistence
```

---

# 185. MODEL REBUILD COMMAND

Provide a clear management command/script.

Example:

```text
python manage.py rebuild_recommendation_model
```

The exact command can differ, but rebuilding must be easy and documented.

---

# 186. MODEL EVALUATION COMMAND

Provide a separate evaluation process.

Example:

```text
python manage.py evaluate_recommendation_model
```

Output should include real calculated metrics when enough data exists.

---

# 187. NO FABRICATED AI

Never:

- return random books and call them AI
- hard-code “recommended” IDs
- fabricate ML accuracy
- fabricate Precision@K
- claim collaborative filtering works without interaction data
- claim personalization without user data

Fallbacks must be clearly implemented.

---

# 188. NO OVERENGINEERING

Do not add:

- unnecessary microservices
- Kubernetes
- complex neural networks
- Elasticsearch
- Kafka
- distributed infrastructure

unless a concrete project requirement justifies them.

The objective is a strong, understandable FYP.

---

# 189. ACADEMIC DEFENSIBILITY

The project should allow the developer/student to explain:

### Problem

Users struggle to discover suitable books in a large catalog.

### Solution

An integrated library platform with advanced search, mood discovery, personalized recommendations, and reading analytics.

### AI Component

Hybrid recommendation engine using content-based filtering, collaborative filtering, mood matching, and user behavior.

### Content Model

TF-IDF + cosine similarity.

### Collaborative Model

User-item interaction relationships.

### Hybrid Model

Weighted normalized ranking.

### Evaluation

Precision@K, Recall@K, Hit Rate@K, NDCG@K where data permits.

---

# 190. FYP VIVA QUESTIONS THE SYSTEM SHOULD ANSWER

The implementation must make it possible to answer:

1. Why did you choose TF-IDF?
2. What is cosine similarity?
3. How does content-based filtering work?
4. What is collaborative filtering?
5. What is the cold-start problem?
6. How do you solve cold-start?
7. How does mood search work?
8. How is mood different from recommendation?
9. What interactions influence recommendations?
10. How are positive and negative signals handled?
11. Why use a hybrid model?
12. How are scores normalized?
13. How are weights selected?
14. How do you prevent repetitive recommendations?
15. How do you evaluate the recommender?
16. How do you protect user data?
17. How does borrowing affect inventory?
18. How is screen/reading time calculated?
19. How does the system handle unavailable books?
20. How is the ML model updated?

---

# 191. REQUIRED FRONTEND PAGES

At minimum implement:

## Public

- Landing
- Catalog
- Search
- Book Details
- Login
- Register

## User

- Dashboard
- Profile
- My Loans
- Favorites
- Wishlist
- Reading History
- Reading Analytics
- Recommendations
- Mood Discovery
- Notifications
- Settings

## Admin/Librarian

- Dashboard
- Books
- Authors
- Genres
- Moods
- Tags
- Inventory
- Loans
- Reservations
- Users
- Reviews
- Recommendation Analytics
- System Settings
- Audit Logs

---

# 192. REQUIRED COMPONENTS

Create reusable components:

- Navbar
- Sidebar
- Footer
- SearchBar
- AdvancedSearchFilters
- BookCard
- BookGrid
- BookDetails
- MoodChip
- MoodSelector
- GenreFilter
- RatingStars
- FavoriteButton
- WishlistButton
- BorrowButton
- RecommendationCard
- RecommendationSection
- ReadingTimer
- AnalyticsCard
- Chart
- DataTable
- Modal
- ConfirmationDialog
- Pagination
- Toast
- LoadingSkeleton
- EmptyState
- ErrorState

---

# 193. READING TIMER UI

The reading timer should support:

- Start
- Pause
- Resume
- End
- current duration
- selected book
- session state

Prevent accidental duplicate sessions.

---

# 194. USER READING DASHBOARD

Display:

- today's time
- weekly time
- monthly time
- total sessions
- average session
- streak
- goals
- recent books

---

# 195. LIBRARY DASHBOARD

Display:

- total books
- available copies
- borrowed copies
- overdue
- reservations
- recent loans

---

# 196. RECOMMENDATION DASHBOARD

Display sections:

```text
Recommended for You
Because You Liked...
Based on Your Mood
Similar to Your Favorites
Popular in Your Interests
Recently Added
```

Only show sections when meaningful data exists.

---

# 197. RECOMMENDATION EXPLANATIONS

Examples:

```text
Similar to books you rated highly
Matches your preferred mood: Historical
Popular among readers with similar interests
Matches your favorite genre: Science Fiction
```

Explanations must be generated from real signals.

---

# 198. ADMIN RECOMMENDATION MONITORING

Show:

- total recommendation requests
- successful responses
- empty responses
- clicks
- CTR
- borrow conversions
- model version
- last rebuild
- catalog coverage

---

# 199. DATABASE RELATIONSHIP SUMMARY

Conceptually:

```text
User
 ├── Profile
 ├── Ratings
 ├── Reviews
 ├── Favorites
 ├── Wishlist
 ├── Loans
 ├── Reservations
 ├── ReadingSessions
 ├── SearchEvents
 ├── RecommendationEvents
 └── Preferences

Book
 ├── Authors
 ├── Genres
 ├── Categories
 ├── Moods
 ├── Tags
 ├── Inventory
 ├── Ratings
 ├── Reviews
 ├── Loans
 └── Recommendations
```

---

# 200. FINAL ACCEPTANCE CRITERIA

The project is complete only when all of the following are true.

## Library

- [ ] Book CRUD works.
- [ ] Author management works.
- [ ] Genre management works.
- [ ] Mood management works.
- [ ] Tag management works.
- [ ] Inventory works.
- [ ] Borrowing works.
- [ ] Returns work.
- [ ] Reservations work.
- [ ] Overdue tracking works.

## Search

- [ ] Normal search works.
- [ ] Advanced search works.
- [ ] Mood search works.
- [ ] Multiple filters work.
- [ ] Sorting works.
- [ ] Pagination works.
- [ ] Empty states work.

## User

- [ ] Registration works.
- [ ] Login works.
- [ ] Logout works.
- [ ] Profile works.
- [ ] Favorites work.
- [ ] Wishlist works.
- [ ] Ratings work.
- [ ] Reviews work.

## Reading

- [ ] Reading sessions work.
- [ ] Timer works.
- [ ] Analytics work.
- [ ] Goals work.
- [ ] Streaks work.

## Recommendation

- [ ] Content-based recommendation works.
- [ ] TF-IDF works.
- [ ] Cosine similarity works.
- [ ] Collaborative recommendation works when data permits.
- [ ] Mood recommendation works.
- [ ] Explicit preferences work.
- [ ] Negative feedback works.
- [ ] Hybrid scoring works.
- [ ] Candidate generation works.
- [ ] Filtering works.
- [ ] Diversification works.
- [ ] Cold-start works.
- [ ] New books can be recommended.
- [ ] Explanations work.
- [ ] Recommendation events are tracked.
- [ ] Evaluation is available.

## Security

- [ ] Passwords are hashed.
- [ ] Protected APIs require authentication.
- [ ] Role permissions are enforced server-side.
- [ ] User data is isolated.
- [ ] Inputs are validated.
- [ ] Uploads are validated.
- [ ] Secrets are not committed.

## Engineering

- [ ] Database migrations work.
- [ ] Seed data works.
- [ ] Tests pass.
- [ ] README is complete.
- [ ] API documentation exists.
- [ ] ML documentation exists.
- [ ] Deployment instructions exist.
- [ ] Error handling exists.
- [ ] Logging exists.
- [ ] Git history is meaningful.

---

# 201. DEVELOPMENT ORDER

Implement in this order unless there is a strong reason to change it:

## Phase 1 — Foundation

- repository
- backend
- frontend
- database
- environment configuration
- authentication

## Phase 2 — Library

- books
- authors
- genres
- moods
- tags
- inventory
- loans
- reservations

## Phase 3 — Search

- catalog
- normal search
- advanced filters
- mood discovery

## Phase 4 — User Engagement

- ratings
- reviews
- favorites
- wishlist

## Phase 5 — Reading Analytics

- reading sessions
- timer
- goals
- charts
- streaks

## Phase 6 — Recommendation Engine

- data pipeline
- TF-IDF
- cosine similarity
- user profiles
- collaborative filtering
- mood scoring
- hybrid scoring
- cold start
- explanations
- evaluation

## Phase 7 — Admin

- dashboards
- management screens
- analytics
- audit logs

## Phase 8 — Quality

- testing
- security
- performance
- accessibility
- responsive design

## Phase 9 — Deployment

- production configuration
- Docker if appropriate
- documentation
- backup
- deployment

---

# 202. DEVELOPMENT BEHAVIOR FOR THE CODING AI

When implementing the project:

1. Inspect the existing repository before changing architecture.
2. Reuse working code where it is correct.
3. Do not overwrite functional features unnecessarily.
4. Maintain backward compatibility where practical.
5. Explain major architectural decisions.
6. Implement complete features rather than mock screens.
7. Do not leave TODO placeholders for core functionality.
8. Do not create fake data to hide missing implementation.
9. Do not claim a feature is complete if it is only a UI mockup.
10. Test every major subsystem.
11. Fix errors before moving to the next major phase.
12. Keep code readable.
13. Keep configuration centralized.
14. Keep ML logic isolated from HTTP/UI code.
15. Keep database operations transactional where necessary.
16. Keep security checks server-side.
17. Keep recommendation explanations tied to actual scores.
18. Keep documentation synchronized with implementation.

---

# 203. DEFINITION OF DONE

A feature is not “done” merely because:

- the page exists
- the button exists
- the endpoint exists
- sample data appears

A feature is done when:

```text
UI
 ↓
API
 ↓
Validation
 ↓
Business Logic
 ↓
Database
 ↓
Error Handling
 ↓
Security
 ↓
Testing
 ↓
Documentation
```

all work together.

---

# 204. FINAL QUALITY STANDARD

Build this project as if another professional developer will maintain it for years.

The application should not look like a collection of university CRUD assignments.

It should look like one coherent software product:

**A modern intelligent digital library platform combining library management, mood-based discovery, personalized book recommendation, and reading/screen-time analytics.**

The recommendation system must be a genuine technical subsystem.

The advanced mood search must be a genuine discovery feature.

The library functionality must be fully database-backed.

The analytics must use real recorded events.

The AI/recommendation claims must correspond to actual algorithms.

The UI must be professional and responsive.

The security model must be real.

The project must be testable.

The architecture must be explainable.

The complete system must be suitable for a serious FYP demonstration and viva.

---

# 205. FINAL IMPLEMENTATION COMMAND

Start by inspecting the existing project/repository.

Then:

1. Create or document the architecture.
2. Establish the database models.
3. Establish authentication and authorization.
4. Implement library management.
5. Implement advanced search and mood discovery.
6. Implement user engagement.
7. Implement reading/session analytics.
8. Build the recommendation data pipeline.
9. Implement content-based recommendation.
10. Implement collaborative recommendation.
11. Implement mood matching.
12. Implement hybrid ranking.
13. Implement cold-start strategies.
14. Implement explanations.
15. Integrate recommendations into the frontend.
16. Add analytics and recommendation tracking.
17. Add admin management.
18. Add tests.
19. Perform security/performance checks.
20. Document everything.
21. Run the complete application.
22. Verify every acceptance criterion.
23. Fix all discovered errors.
24. Only then declare the project complete.

Do not skip foundational work merely to reach the UI quickly.

Do not replace required functionality with placeholders.

Do not fabricate machine-learning results.

Build the complete system end-to-end.
