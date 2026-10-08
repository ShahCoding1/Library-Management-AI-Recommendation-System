/**
 * Centralized API Service for Book Recommendation, Screen-Time & Library Management System.
 * Connects to Django REST Framework backend at /api/v1/
 */

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Handle 204 No Content
    if (res.status === 204) return null;

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.detail || 'Request failed';
      const errorObj = new Error(errorMsg);
      errorObj.status = res.status;
      errorObj.details = data?.error?.details || data;
      throw errorObj;
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Authentication
  login: (email, password) => request('/auth/login/', { method: 'POST', body: { email, password } }),
  register: (userData) => request('/auth/register/', { method: 'POST', body: userData }),
  getMe: () => request('/auth/me/'),
  getProfile: () => request('/users/me/profile/'),
  updateProfile: (profileData) => request('/users/me/profile/', { method: 'PATCH', body: profileData }),
  getPreferences: () => request('/users/me/preferences/'),
  updatePreferences: (prefData) => request('/users/me/preferences/', { method: 'POST', body: prefData }),

  // Books & Catalog
  getBooks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/books/${query ? `?${query}` : ''}`);
  },
  getBook: (id) => request(`/books/${id}/`),
  createBook: (bookData) => request('/books/', { method: 'POST', body: bookData }),
  updateBook: (id, bookData) => request(`/books/${id}/`, { method: 'PATCH', body: bookData }),
  getSimilarBooks: (id) => request(`/books/${id}/similar/`),
  rateBook: (id, score) => request(`/books/${id}/rate/`, { method: 'POST', body: { score } }),
  getReviews: (id) => request(`/books/${id}/reviews/`),
  addReview: (id, content) => request(`/books/${id}/reviews/`, { method: 'POST', body: { content } }),

  // Taxonomy & Metadata
  getMoods: () => request('/books/moods/'),
  getGenres: () => request('/books/genres/'),
  getCategories: () => request('/books/categories/'),
  getAuthors: () => request('/books/authors/'),

  // Search Engine
  search: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/search/${query ? `?${query}` : ''}`);
  },
  autocomplete: (q) => request(`/search/autocomplete/?q=${encodeURIComponent(q)}`),

  // Recommendation Engine
  getRecommendations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/recommendations/${query ? `?${query}` : ''}`);
  },
  getMyRecommendations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/recommendations/me/${query ? `?${query}` : ''}`);
  },
  getMoodRecommendations: (slug, limit = 12) => request(`/recommendations/mood/${slug}/?limit=${limit}`),
  recordEvent: (bookId, eventType) => request('/recommendations/events/', { method: 'POST', body: { book_id: bookId, event_type: eventType } }),

  // Library & Circulation
  borrowBook: (bookId, notes = '') => request('/library/borrow/', { method: 'POST', body: { book_id: bookId, notes } }),
  returnBook: (loanId) => request('/library/return/', { method: 'POST', body: { loan_id: loanId } }),
  renewLoan: (loanId) => request('/library/renew/', { method: 'POST', body: { loan_id: loanId } }),
  reserveBook: (bookId) => request('/library/reserve/', { method: 'POST', body: { book_id: bookId } }),
  getMyLoans: (status = '') => request(`/library/my-loans/${status ? `?status=${status}` : ''}`),
  getMyReservations: () => request('/library/my-reservations/'),
  toggleFavorite: (bookId) => request('/library/favorites/toggle/', { method: 'POST', body: { book_id: bookId } }),
  getMyFavorites: () => request('/library/my-favorites/'),
  toggleWishlist: (bookId) => request('/library/wishlist/toggle/', { method: 'POST', body: { book_id: bookId } }),
  getMyWishlist: () => request('/library/my-wishlist/'),

  // Screen-Time & Reading Analytics
  startReadingSession: (bookId = null) => request('/analytics/reading-sessions/start/', { method: 'POST', body: { book_id: bookId } }),
  heartbeatSession: (sessionId) => request(`/analytics/reading-sessions/${sessionId}/heartbeat/`, { method: 'POST' }),
  endReadingSession: (sessionId, pagesRead = 0) => request(`/analytics/reading-sessions/${sessionId}/end/`, { method: 'POST', body: { pages_read: pagesRead } }),
  getActiveSession: () => request('/analytics/reading-sessions/active/'),
  getUserAnalytics: () => request('/analytics/user/'),
  getAdminAnalytics: () => request('/analytics/admin/'),

  // Admin & Monitoring
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users/admin/users/${query ? `?${query}` : ''}`);
  },
  updateUserRole: (id, role) => request(`/users/admin/users/${id}/`, { method: 'PATCH', body: { role } }),
  updateUserStatus: (id, is_active) => request(`/users/admin/users/${id}/`, { method: 'PATCH', body: { is_active } }),
  getAdminLoans: () => request('/library/admin/loans/'),
  getAdminInventory: () => request('/library/admin/inventory/'),
  getAdminAuditLogs: () => request('/library/admin/audit-logs/'),
  getAdminRecStats: () => request('/recommendations/admin/stats/'),
  rebuildRecommendationModel: () => request('/recommendations/admin/rebuild/', { method: 'POST' }),
  getAdminRecDebug: (bookId = '', userId = '') => {
    const query = new URLSearchParams();
    if (bookId) query.set('book_id', bookId);
    if (userId) query.set('user_id', userId);
    return request(`/recommendations/admin/debug/?${query.toString()}`);
  },
};

