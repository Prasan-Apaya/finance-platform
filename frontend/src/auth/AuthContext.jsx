import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      let resolvedUsername = localStorage.getItem('username');
      if (resolvedUsername === 'undefined' || resolvedUsername === 'null') {
        resolvedUsername = null;
      }
      let resolvedUserId = localStorage.getItem('userId');
      let resolvedEmail = null;

      try {
        const decoded = jwtDecode(token);
        resolvedUserId = resolvedUserId || decoded.sub;
        resolvedEmail = decoded.email;
        if (!resolvedUsername) {
          resolvedUsername = decoded.email?.split('@')[0] || decoded.email;
        }
      } catch (e) {
        // Token invalid or unparseable
      }

      if (resolvedUsername) localStorage.setItem('username', resolvedUsername);
      if (resolvedUserId) localStorage.setItem('userId', String(resolvedUserId));

      setUser({
        id: resolvedUserId,
        username: resolvedUsername || 'User',
        email: resolvedEmail,
      });
    }
    setLoading(false);
  }, []);

  const login = (token, username) => {
    localStorage.setItem('token', token);
    let resolvedUserId = null;
    let resolvedEmail = null;
    let resolvedUsername =
      username && username !== 'undefined' && username !== 'null' ? username : null;

    try {
      const decoded = jwtDecode(token);
      resolvedUserId = decoded.sub;
      resolvedEmail = decoded.email;
      if (!resolvedUsername) {
        resolvedUsername = decoded.email?.split('@')[0] || decoded.email;
      }
    } catch (e) {
      // ignore
    }

    if (resolvedUsername) localStorage.setItem('username', resolvedUsername);
    if (resolvedUserId) localStorage.setItem('userId', String(resolvedUserId));

    setUser({
      id: resolvedUserId,
      username: resolvedUsername || 'User',
      email: resolvedEmail,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
