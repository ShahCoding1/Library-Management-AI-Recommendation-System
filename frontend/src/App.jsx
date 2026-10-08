import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReadingSessionProvider, useReadingSession } from './contexts/ReadingSessionContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReadingTimerBar from './components/ReadingTimerBar';
import AuthModal from './components/AuthModal';
import BorrowModal from './components/BorrowModal';

// Pages
import LandingPage from './pages/LandingPage';
import CatalogPage from './pages/CatalogPage';
import BookDetailPage from './pages/BookDetailPage';
import MoodDiscoveryPage from './pages/MoodDiscoveryPage';
import UserDashboardPage from './pages/UserDashboardPage';
import MyLoansPage from './pages/MyLoansPage';
import SavedPage from './pages/SavedPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const [tab, setTabState] = useState('landing');
  const [tabParams, setTabParams] = useState({});
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [borrowModalBook, setBorrowModalBook] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const { activeSession } = useReadingSession();


  const setTab = (newTab, params = {}) => {
    setTabState(newTab);
    setTabParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBook = (bookOrId) => {
    const id = typeof bookOrId === 'object' ? bookOrId.id : bookOrId;
    setSelectedBookId(id);
    setTabState('book-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBorrow = (book) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setBorrowModalBook(book);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentTab={tab}
        setTab={setTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main style={{ flex: 1 }}>
        {tab === 'landing' && (
          <LandingPage
            setTab={setTab}
            onSelectBook={handleSelectBook}
            onBorrow={handleBorrow}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {tab === 'catalog' && (
          <CatalogPage
            initialParams={tabParams}
            onSelectBook={handleSelectBook}
            onBorrow={handleBorrow}
          />
        )}

        {tab === 'moods' && (
          <MoodDiscoveryPage
            initialMoodSlug={tabParams.slug}
            onSelectBook={handleSelectBook}
            onBorrow={handleBorrow}
          />
        )}

        {tab === 'book-detail' && (
          <BookDetailPage
            bookId={selectedBookId}
            onBack={() => setTab('catalog')}
            onSelectBook={handleSelectBook}
            onBorrow={handleBorrow}
          />
        )}

        {tab === 'dashboard' && (
          <UserDashboardPage
            setTab={setTab}
            onSelectBook={handleSelectBook}
            onBorrow={handleBorrow}
          />
        )}

        {tab === 'loans' && (
          <MyLoansPage
            onSelectBook={handleSelectBook}
          />
        )}

        {tab === 'saved' && (
          <SavedPage
            setTab={setTab}
            onSelectBook={handleSelectBook}
            onBorrow={handleBorrow}
          />
        )}

        {tab === 'analytics' && (
          <AnalyticsPage
            setTab={setTab}
          />
        )}

        {tab === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Floating Bottom Live Reading Timer Bar */}
      {activeSession && <ReadingTimerBar />}

      <Footer onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Authentication Modal */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
            setTab('dashboard');
          }}
        />
      )}

      {/* Borrow / Reservation Modal */}
      {borrowModalBook && (
        <BorrowModal
          book={borrowModalBook}
          isOpen={!!borrowModalBook}
          onClose={() => setBorrowModalBook(null)}
          onSuccess={() => {
            setBorrowModalBook(null);
            setTab('loans');
          }}

        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ReadingSessionProvider>
        <AppContent />
      </ReadingSessionProvider>
    </AuthProvider>
  );
}
