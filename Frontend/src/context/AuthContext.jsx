import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AuthContext = createContext(null);

const API_URL = "http://localhost:8080/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  // Restore the user's session when the application loads.
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to restore user session:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    const data = response.data;

    const loggedInUser = {
      id: data.userId ?? data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      patientId: data.patientId ?? null,
      doctorId: data.doctorId ?? null,
    };

    if (!data.token || !loggedInUser.role) {
      throw new Error("Invalid login response from server.");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setToken(data.token);
    setUser(loggedInUser);

    return loggedInUser;
  };

  // Register
  const register = async (name, email, password) => {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
    });

    return response.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  // Add JWT to authenticated API requests.
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("token");

        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(token && user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}