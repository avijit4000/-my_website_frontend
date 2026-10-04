import { useMemo, useState } from 'react';

const books = [
  { id: 1, title: 'Book A', price: 299, category: 'Fiction' },
  { id: 2, title: 'Book B', price: 349, category: 'Technology' },
  { id: 3, title: 'Book C', price: 399, category: 'History' },
  { id: 4, title: 'Book D', price: 279, category: 'Mystery' },
  { id: 5, title: 'Book E', price: 429, category: 'Self Help' },
  { id: 6, title: 'Book F', price: 319, category: 'Fantasy' },
  { id: 7, title: 'Book G', price: 389, category: 'Science' },
  { id: 8, title: 'Book H', price: 459, category: 'Business' },
  { id: 9, title: 'Book I', price: 329, category: 'Adventure' },
  { id: 10, title: 'Book J', price: 499, category: 'Biography' },
];

function App() {
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const totalBooks = useMemo(() => books.length, []);
  const loggedIn = Boolean(user);

  const request = async (path, options = {}) => {
    let response;
    try {
      response = await fetch(`${apiBaseUrl}/auth/${path}`, {
        ...options,
        headers: {
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
      });
    } catch {
      throw new Error(`Cannot reach the backend. Make sure it is running on ${apiBaseUrl}.`);
    }

    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      const detail = data?.detail;
      throw new Error(typeof detail === 'string' ? detail : 'The request could not be completed.');
    }
    return data;
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    const credentials = { email: email.trim(), password };

    try {
      if (authMode === 'register') {
        await request('register', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
      }

      const tokenResponse = await request('login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      const currentUser = await request('me', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });

      setToken(tokenResponse.access_token);
      setUser(currentUser);
      setPassword('');
      setMessage(authMode === 'register' ? 'Account created. You are now signed in.' : `Welcome back, ${currentUser.email}!`);
      setMessageType('success');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await request('logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('You have been logged out.');
      setMessageType('success');
    } catch (error) {
      setMessage(`${error.message} You have been signed out on this device.`);
      setMessageType('error');
    } finally {
      setToken('');
      setUser(null);
      setPassword('');
      setIsSubmitting(false);
    }
  };

  const handleBuy = (title) => {
    setMessage(`${title} is available in your library while you are signed in.`);
    setMessageType('success');
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <span className="brand-mark">A</span>
          <div>
            <p className="brand-badge">AVIJIT</p>
            <small>Book Store</small>
          </div>
        </div>

        {loggedIn && (
          <button className="login-btn" type="button" onClick={handleLogout} disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : 'Logout'}
          </button>
        )}
      </header>

      <main className="hero-section">
        <section className="hero-copy">
          <p className="eyebrow">Curated reads for every mind</p>
          <h1>Welcome to AVIJIT</h1>
          <p className="hero-text">
            Discover the best books, stories, and ideas in one place. Browse book information freely, then sign in to access your library.
          </p>

          <div className="stats-row">
            <div>
              <strong>{totalBooks}</strong>
              <span>Books</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Access</span>
            </div>
            <div>
              <strong>Secure</strong>
              <span>Checkout</span>
            </div>
          </div>
        </section>

        <aside className="login-panel">
          <h2>{loggedIn ? 'You’re signed in' : authMode === 'login' ? 'Login to Purchase' : 'Create an Account'}</h2>
          {!loggedIn ? (
            <>
              <div className="auth-mode-switch" role="group" aria-label="Choose authentication mode">
                <button
                  className={authMode === 'login' ? 'auth-mode-button active' : 'auth-mode-button'}
                  type="button"
                  aria-pressed={authMode === 'login'}
                  onClick={() => { setAuthMode('login'); setMessage(''); }}
                >
                  Login
                </button>
                <button
                  className={authMode === 'register' ? 'auth-mode-button active' : 'auth-mode-button'}
                  type="button"
                  aria-pressed={authMode === 'register'}
                  onClick={() => { setAuthMode('register'); setMessage(''); }}
                >
                  New user
                </button>
              </div>
              <form onSubmit={handleAuthSubmit} className="login-form">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  placeholder={authMode === 'register' ? 'At least 12 characters' : 'Your password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={authMode === 'register' ? 12 : undefined}
                  maxLength={128}
                  required
                />
                {authMode === 'register' && <small className="password-hint">Use 12–128 characters.</small>}
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Please wait…' : authMode === 'register' ? 'Create Account' : 'Login'}
                </button>
              </form>
            </>
          ) : (
            <div className="loggedin-box">
              <p>Signed in as</p>
              <strong>{user.email}</strong>
              <button className="panel-logout-btn" type="button" onClick={handleLogout} disabled={isSubmitting}>
                {isSubmitting ? 'Please wait…' : 'Logout'}
              </button>
            </div>
          )}

          {message && <p className={`message-box ${messageType}`} role="status">{message}</p>}
        </aside>
      </main>

      <section className="books-section">
        <div className="section-header">
          <h2>Book Information</h2>
          <span>{totalBooks} titles in the catalog</span>
        </div>

        <div className="books-grid">
          {books.map((book) => (
            <article className="book-card" key={book.id}>
              <div className="book-cover">
                <span>{book.title}</span>
              </div>
              <div className="book-info">
                <p className="book-category">{book.category}</p>
                <h3>{book.title}</h3>
                <div className="book-meta">
                  <strong>₹{book.price}</strong>
                  <span>{loggedIn ? 'In your library' : 'Information only'}</span>
                </div>
                <button type="button" onClick={() => handleBuy(book.title)} disabled={!loggedIn}>
                  {loggedIn ? 'Available to You' : 'Login to Access'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {loggedIn && (
        <section className="library-section" aria-labelledby="library-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Signed-in access</p>
              <h2 id="library-title">Your Library</h2>
            </div>
            <span>{totalBooks} books available</span>
          </div>
          <div className="library-grid">
            {books.map((book) => (
              <article className="library-book" key={book.id}>
                <span className="library-book-mark" aria-hidden="true">✓</span>
                <div>
                  <h3>{book.title}</h3>
                  <p>{book.category}</p>
                </div>
                <span className="availability-label">Available</span>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
