# 📖 Database Schema & Data Dictionary

## Project: Book Recommendation, Screen-Time & Library Management System

This document outlines all relational database tables, columns, primary/foreign keys, constraints, and normalization structures implemented in the Django ORM.

---

## 1. Authentication & Accounts Domain

### Table: `accounts_user`
Extends Django AbstractUser with email-based authentication and role-based access control.

| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `email` | `VARCHAR(254)` | No | - | Unique, case-insensitive user email |
| `full_name` | `VARCHAR(150)` | Yes | `""` | Reader or Admin display name |
| `role` | `VARCHAR(20)` | No | `'READER'` | Choice: `READER`, `LIBRARIAN`, `ADMIN` |
| `is_active` | `BOOLEAN` | No | `True` | Account status active/deactivated |
| `is_staff` | `BOOLEAN` | No | `False` | Staff access flag |
| `date_joined` | `TIMESTAMPTZ`| No | Now | Timestamp of registration |

### Table: `accounts_userprofile`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `user_id` | `BIGINT` | No | - | Foreign Key $\to$ `accounts_user.id` (1-to-1) |
| `bio` | `TEXT` | Yes | `""` | User reader bio |
| `reading_goal_minutes_per_day`| `INTEGER` | No | `30` | Daily screen-time reading goal (minutes) |
| `favorite_quote` | `VARCHAR(255)` | Yes | `""` | Favorite literary quote |

### Table: `accounts_userpreference`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `user_id` | `BIGINT` | No | - | Foreign Key $\to$ `accounts_user.id` (1-to-1) |
| `onboarding_completed` | `BOOLEAN` | No | `False` | Initial mood/genre questionnaire flag |

---

## 2. Books & Taxonomy Domain

### Table: `books_author`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `name` | `VARCHAR(255)` | No | - | Unique Author name |
| `bio` | `TEXT` | Yes | `""` | Author biography |

### Table: `books_genre`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `name` | `VARCHAR(100)` | No | - | Genre title |
| `slug` | `VARCHAR(100)` | No | - | Unique URL-safe identifier |

### Table: `books_mood`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `name` | `VARCHAR(100)` | No | - | 18 Mood names (Sad, Romantic, etc.) |
| `slug` | `VARCHAR(100)` | No | - | Unique mood slug |
| `color_code` | `VARCHAR(20)` | No | `'#6366F1'` | Hex color token for UI rendering |
| `icon` | `VARCHAR(50)` | No | `'Sparkles'` | Lucide icon identifier |

### Table: `books_book`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `title` | `VARCHAR(255)` | No | - | Book title (Indexed) |
| `subtitle` | `VARCHAR(255)` | Yes | `""` | Subtitle |
| `isbn` | `VARCHAR(20)` | Yes | `""` | ISBN identifier |
| `description` | `TEXT` | No | - | Synopsis / text profile for TF-IDF |
| `publication_year` | `INTEGER` | Yes | - | Year published |
| `page_count` | `INTEGER` | No | `200` | Page count |
| `cover_image_url` | `VARCHAR(500)` | Yes | `""` | Cover image CDN link |
| `total_copies` | `INTEGER` | No | `1` | Total inventory acquired |
| `available_copies` | `INTEGER` | No | `1` | Available copies on shelf |
| `average_rating` | `FLOAT` | No | `0.0` | Cached average rating score |
| `ratings_count` | `INTEGER` | No | `0` | Total number of rating submissions |
| `is_active` | `BOOLEAN` | No | `True` | Catalog availability |

---

## 3. Library Circulation Domain

### Table: `library_inventoryitem`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `book_id` | `BIGINT` | No | - | Foreign Key $\to$ `books_book.id` |
| `copy_code` | `VARCHAR(50)` | No | - | Unique physical barcode (e.g. `2001-001`) |
| `status` | `VARCHAR(20)` | No | `'AVAILABLE'` | Choice: `AVAILABLE`, `ON_LOAN`, `MAINTENANCE` |
| `location_shelf` | `VARCHAR(50)` | Yes | `""` | Physical library shelf location |

### Table: `library_loan`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `user_id` | `BIGINT` | No | - | Foreign Key $\to$ `accounts_user.id` |
| `book_id` | `BIGINT` | No | - | Foreign Key $\to$ `books_book.id` |
| `inventory_item_id` | `BIGINT` | No | - | Foreign Key $\to$ `library_inventoryitem.id` |
| `issue_date` | `TIMESTAMPTZ`| No | Now | Timestamp when book was checked out |
| `due_date` | `TIMESTAMPTZ`| No | - | Issue date + 14 days (or + renewals) |
| `return_date` | `TIMESTAMPTZ`| Yes | `NULL` | Timestamp when physical copy returned |
| `status` | `VARCHAR(20)` | No | `'ACTIVE'` | Choice: `ACTIVE`, `RETURNED`, `OVERDUE` |
| `renewal_count` | `INTEGER` | No | `0` | Current renewals count (Max 2) |

### Table: `library_reservation`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `user_id` | `BIGINT` | No | - | Foreign Key $\to$ `accounts_user.id` |
| `book_id` | `BIGINT` | No | - | Foreign Key $\to$ `books_book.id` |
| `queue_position` | `INTEGER` | No | `1` | Position in waitlist queue (`#1`, `#2`, etc.) |
| `status` | `VARCHAR(20)` | No | `'ACTIVE'` | Choice: `ACTIVE`, `FULFILLED`, `CANCELLED` |

---

## 4. Screen-Time & Reading Analytics Domain

### Table: `analytics_readingsession`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `user_id` | `BIGINT` | No | - | Foreign Key $\to$ `accounts_user.id` |
| `book_id` | `BIGINT` | Yes | `NULL` | Foreign Key $\to$ `books_book.id` (Optional) |
| `started_at` | `TIMESTAMPTZ`| No | Now | Session start timestamp |
| `ended_at` | `TIMESTAMPTZ`| Yes | `NULL` | Session end timestamp |
| `duration_seconds` | `INTEGER` | No | `0` | Elapsed duration (Anti-idling capped) |
| `pages_read` | `INTEGER` | No | `0` | Pages logged during session |
| `is_completed` | `BOOLEAN` | No | `False` | Completion status |

### Table: `analytics_userstreak`
| Column | Type | Nullable | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto | Primary Key |
| `user_id` | `BIGINT` | No | - | Foreign Key $\to$ `accounts_user.id` (1-to-1) |
| `current_streak` | `INTEGER` | No | `0` | Consecutive days active |
| `longest_streak` | `INTEGER` | No | `0` | Historical highest streak |
| `last_activity_date` | `DATE` | Yes | `NULL` | Last calendar date of verified reading |
