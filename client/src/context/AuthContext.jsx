import { createContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser, getCurrentUser } from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("cc_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, if a token exists, verify it's still valid and refresh the
  // user object (handles the case where localStorage has a stale user but
  // an expired/invalid token).
  useEffect(() => {
    const token = localStorage.getItem("cc_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem("cc_user", JSON.stringify(freshUser));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("cc_token");
        localStorage.removeItem("cc_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const { token, user: loggedInUser } = await loginUser(credentials);
      localStorage.setItem("cc_token", token);
      localStorage.setItem("cc_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (details) => {
    setError(null);
    try {
      const { token, user: newUser } = await registerUser(details);
      localStorage.setItem("cc_token", token);
      localStorage.setItem("cc_user", JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
